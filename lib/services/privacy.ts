import "server-only";

import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import { logError } from "@/lib/observability/log";
import type { DeletionRequestInput } from "@/lib/validators/privacy";

/**
 * Registra una solicitud de baja del sitio público.
 *
 * Va por service role, igual que la postulación anónima: `deletion_requests` no
 * tiene política para `anon`, así que el público puede pedir la baja pero no
 * puede leer la cola de solicitudes de otros.
 *
 * Se responde igual exista o no el email. Decir "no tenemos tus datos" sería
 * convertir este endpoint en un oráculo para saber quién se postuló.
 */
export async function requestDataDeletion(input: DeletionRequestInput): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const email = input.email.trim().toLowerCase();

  const { error } = await supabase.from("deletion_requests").insert({
    email,
    reason: input.reason || null,
  });

  if (error) {
    // 23505 = ya hay una solicitud pendiente para ese email. Para el usuario el
    // resultado es el mismo, así que no se le informa nada distinto.
    if (error.code === "23505") {
      return;
    }
    throw new Error(`deletion_requests.insert falló: ${error.message}`);
  }
}

export type DeletionOutcome = {
  candidateFound: boolean;
  deletedCvCount: number;
};

/**
 * Ejecuta el borrado real de los datos de un candidato.
 *
 * El SQL no puede tocar Storage, así que `delete_candidate_data` devuelve las
 * rutas de los PDFs y acá se borran del bucket. Sin este paso quedarían CVs
 * huérfanos con PII adentro después de haber "borrado" al candidato.
 *
 * Orden deliberado: primero las filas, después los archivos. Si falla el borrado
 * de archivos queda un huérfano (detectable y purgable); al revés quedaría una
 * ficha apuntando a un archivo inexistente.
 */
export async function executeDataDeletion(email: string): Promise<DeletionOutcome> {
  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .rpc("delete_candidate_data", { p_email: email.trim().toLowerCase() })
    .select("deleted_candidate_id, cv_paths")
    .maybeSingle<{ deleted_candidate_id: string; cv_paths: string[] }>();

  if (error) {
    throw new Error(`delete_candidate_data falló: ${error.message}`);
  }

  if (!data?.deleted_candidate_id) {
    return { candidateFound: false, deletedCvCount: 0 };
  }

  const paths = (data.cv_paths ?? []).filter(Boolean);
  if (paths.length === 0) {
    return { candidateFound: true, deletedCvCount: 0 };
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET no configurado");
  }

  const { error: storageError } = await supabase.storage.from(bucket).remove(paths);

  if (storageError) {
    // Las filas ya se borraron: no se revierte, pero queda registrado para
    // poder limpiar los archivos a mano.
    logError("privacy.storageRemove", new Error(storageError.message), { paths });
    return { candidateFound: true, deletedCvCount: 0 };
  }

  return { candidateFound: true, deletedCvCount: paths.length };
}

export type DeletionRequestRow = {
  id: string;
  email: string;
  reason: string | null;
  status: "pending" | "completed" | "rejected";
  requested_at: string;
};

export async function listDeletionRequests(): Promise<DeletionRequestRow[]> {
  // Cliente del usuario: RLS ("staff manage deletion requests") autoriza.
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("deletion_requests")
    .select("id,email,reason,status,requested_at")
    .order("status")
    .order("requested_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`deletion_requests.select falló: ${error.message}`);
  }

  return (data ?? []) as DeletionRequestRow[];
}

export async function getDeletionRequest(id: string): Promise<DeletionRequestRow> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("deletion_requests")
    .select("id,email,reason,status,requested_at")
    .eq("id", id)
    .maybeSingle<DeletionRequestRow>();

  if (error) {
    throw new Error(`deletion_requests.select falló: ${error.message}`);
  }

  if (!data) {
    throw new AppError("deletion_request_not_found", 404, "Solicitud no encontrada");
  }

  return data;
}

export async function resolveDeletionRequest(
  id: string,
  status: "completed" | "rejected",
  resolvedBy: string,
  notes?: string,
): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("deletion_requests")
    .update({
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`deletion_requests.update falló: ${error.message}`);
  }
}
