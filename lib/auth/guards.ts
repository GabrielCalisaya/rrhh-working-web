import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export function hasRequiredRole(role: AppRole | null, allowedRoles: AppRole[]) {
  return role ? allowedRoles.includes(role) : false;
}

export async function requireStaffAccess(allowedRoles: AppRole[] = ["admin", "recruiter"]) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!hasRequiredRole((profile?.role as AppRole | null) ?? null, allowedRoles)) {
    redirect("/");
  }

  return user;
}
