import "server-only";

import { getStaffSession } from "@/lib/auth/session";
import { appErrors } from "@/lib/errors";
import type { AppRole } from "@/lib/types";

export type StaffContext = {
  userId: string;
  role: AppRole;
};

/**
 * Guard de autorización para rutas API.
 *
 * Reemplaza las tres copias idénticas de `getCurrentUserRole()` que vivían en
 * app/api/applications/route.ts, app/api/vacancies/route.ts y
 * app/api/admin/users/route.ts. Tener la comprobación de rol duplicada en cada
 * ruta es exactamente el patrón que hace que una ruta nueva se olvide de ella.
 *
 * Lanza AppError, así que errorResponse() ya sabe traducirlo a 401/403.
 */
export async function requireStaffApi(allowedRoles: AppRole[] = ["admin", "recruiter"]): Promise<StaffContext> {
  const session = await getStaffSession();

  if (!session) {
    throw appErrors.unauthorized();
  }

  if (!session.role || !allowedRoles.includes(session.role)) {
    throw appErrors.forbidden();
  }

  return { userId: session.user.id, role: session.role };
}
