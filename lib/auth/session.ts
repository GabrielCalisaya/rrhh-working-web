import "server-only";

import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

export type StaffSession = {
  user: { id: string; email?: string };
  role: AppRole | null;
  fullName: string;
};

/**
 * Sesión del usuario staff, memoizada por request.
 *
 * `cache()` de React deduplica las llamadas dentro del mismo render. Sin esto,
 * una carga de /admin/vacantes repetía la pareja auth.getUser() + profiles.select
 * cuatro veces: en el Header, dos en el layout (requireStaffAccess y
 * getStaffSession) y otra en la página. Eran ~8 roundtrips secuenciales a
 * Supabase para renderizar una tabla.
 */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const role = (profile?.role as AppRole | null) ?? null;
  const fullName = profile?.full_name ?? user.email ?? "Usuario";

  if (!role || !["admin", "recruiter"].includes(role)) {
    return { user, role: null, fullName };
  }

  return { user, role, fullName };
});
