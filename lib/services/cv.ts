import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";

/** Vida corta a propósito: la URL es un bearer token, no debe circular. */
const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Emite una URL firmada para descargar el CV de una postulación.
 *
 * Antes no existía ningún camino para leer los CVs: se guardaba `cv_file_path`
 * y nunca se leía, así que los archivos quedaban inaccesibles y la política
 * "staff read cvs" de storage.sql no se ejercitaba nunca.
 *
 * La ruta NO viene del cliente: se resuelve desde la postulación en la base.
 * Así, aunque alguien conozca el path de un CV ajeno, no puede pedirlo.
 */
export async function createCvSignedUrl(applicationId: string): Promise<string> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET no configurado");
  }

  // Cliente del usuario: la lectura de la postulación pasa por
  // "staff manage applications" y la firma por "staff read cvs" (storage.sql).
  // Así RLS es una segunda barrera además del guard de la ruta.
  const supabase = await getSupabaseServerClient();

  const { data: application, error } = await supabase
    .from("applications")
    .select("id, cv_file_path")
    .eq("id", applicationId)
    .single<{ id: string; cv_file_path: string | null }>();

  if (error || !application) {
    throw new AppError("cv_not_found", 404, "Postulación no encontrada");
  }

  if (!application.cv_file_path) {
    throw new AppError("cv_not_found", 404, "Esta postulación no tiene CV adjunto");
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(application.cv_file_path, SIGNED_URL_TTL_SECONDS, { download: true });

  if (signError || !signed?.signedUrl) {
    throw new Error(`storage.createSignedUrl falló: ${signError?.message ?? "sin URL"}`);
  }

  return signed.signedUrl;
}
