import "server-only";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logAudit, logError } from "@/lib/observability/log";

export type AuditAction =
  | "role.changed"
  | "cv.downloaded"
  | "application.status_changed"
  | "candidate.deleted"
  | "deletion_request.created"
  | "deletion_request.rejected";

type AuditEntry = {
  action: AuditAction;
  actorId?: string | null;
  actorRole?: string | null;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Registra una acción sensible en `audit_log` y en el log de la plataforma.
 *
 * Se escribe en los dos lados a propósito: la tabla sobrevive a la rotación de
 * logs de Vercel y es consultable desde el panel; el log sirve para correlacionar
 * con el resto de la traza del request.
 *
 * NUNCA lanza. Que falle la auditoría no puede tumbar la operación que la
 * originó: un error escribiendo el registro de "rol cambiado" no debe impedir
 * que el rol se cambie. La contrapartida es que un fallo silencioso de la tabla
 * deja huecos, por eso queda además en el log de errores.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  logAudit(entry.action, {
    actorId: entry.actorId ?? null,
    actorRole: entry.actorRole ?? null,
    targetType: entry.targetType ?? null,
    targetId: entry.targetId ?? null,
    ...entry.metadata,
  });

  try {
    // Service role: audit_log no tiene política de insert a propósito, para que
    // nadie pueda escribir ni borrar registros desde el cliente.
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase.from("audit_log").insert({
      action: entry.action,
      actor_id: entry.actorId ?? null,
      actor_role: entry.actorRole ?? null,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? {},
    });

    if (error) {
      logError("audit.persist", new Error(error.message), { action: entry.action });
    }
  } catch (error) {
    logError("audit.persist", error, { action: entry.action });
  }
}
