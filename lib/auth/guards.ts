import "server-only";

import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/types";
import { getStaffSession } from "@/lib/auth/session";

export function hasRequiredRole(role: AppRole | null, allowedRoles: AppRole[]) {
  return role ? allowedRoles.includes(role) : false;
}

/**
 * Guard de las páginas de /admin.
 *
 * Usa getStaffSession(), memoizada con cache() de React: llamarla en el layout y
 * otra vez en la página no duplica las consultas a Supabase.
 */
export async function requireStaffAccess(allowedRoles: AppRole[] = ["admin", "recruiter"]) {
  const session = await getStaffSession();

  if (!session) {
    redirect("/");
  }

  if (!hasRequiredRole(session.role, allowedRoles)) {
    redirect("/");
  }

  return session.user;
}
