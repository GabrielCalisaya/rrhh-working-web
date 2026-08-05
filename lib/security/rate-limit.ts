import "server-only";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logError } from "@/lib/observability/log";

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

/**
 * Consume una unidad de cuota contra la tabla `rate_limits` de Postgres.
 *
 * La versión anterior usaba un Map en memoria del proceso: en Vercel serverless
 * cada instancia tiene el suyo y se reinicia en frío, así que el límite
 * declarado no se aplicaba nunca. El conteo ahora es compartido y atómico
 * (ver supabase/migrations/002_rate_limits.sql).
 *
 * Falla abierto: si la base no responde, se permite el request y se registra el
 * error. Bloquear postulaciones legítimas por una caída de infraestructura es
 * peor que perder temporalmente el techo de abuso.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .rpc("consume_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_ms: windowMs,
      })
      .single<{ allowed: boolean; retry_after: number }>();

    if (error || !data) {
      logError("rateLimit.rpc", error ?? new Error("sin datos"), { key });
      return { ok: true };
    }

    if (!data.allowed) {
      return { ok: false, retryAfter: data.retry_after };
    }

    return { ok: true };
  } catch (error) {
    logError("rateLimit", error, { key });
    return { ok: true };
  }
}

/**
 * IP del cliente.
 *
 * Se prefieren las cabeceras que pone la plataforma y que el cliente no puede
 * falsificar: Vercel descarta cualquier `x-vercel-*` entrante. `x-forwarded-for`
 * queda de último recurso porque su primer valor sí es controlable por el
 * cliente cuando no hay un proxy de confianza adelante.
 */
export function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}
