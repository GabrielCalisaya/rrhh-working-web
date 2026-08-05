// Barrera de compilación: si algún día un Client Component importa este módulo
// (aunque sea indirectamente), el build falla en vez de mandar la service role
// key al bundle público. Es el único mecanismo que garantiza que no se filtre.
import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase public env vars are missing");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookieToSet) => {
        cookieToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Cliente con la service role key. BYPASSEA RLS POR COMPLETO.
 *
 * Usarlo solo donde no hay usuario autenticado del cual derivar permisos, o donde
 * la tabla deliberadamente no tiene políticas.
 * Allowlist actual (7 usos; cualquier agregado va con justificación en review):
 *
 *   lib/security/rate-limit.ts     tabla rate_limits, sin políticas a propósito
 *   lib/observability/audit.ts     audit_log es append-only, nadie escribe desde el cliente
 *   lib/services/vacancy-guards.ts validación de vacante en el flujo anónimo
 *   lib/services/applications.ts   createApplication   (postulación anónima)
 *   lib/services/applications.ts   uploadCvFile        (subida anónima a Storage)
 *   lib/services/privacy.ts        requestDataDeletion (solicitud de baja anónima)
 *   lib/services/privacy.ts        executeDataDeletion (borrado + limpieza de Storage)
 *
 * Todo lo demás usa getSupabaseServerClient() y lo autoriza RLS.
 */
export function getSupabaseServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service env vars are missing");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
