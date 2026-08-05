import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Contadores del dashboard.
 *
 * Con el cliente del usuario, cada uno cuenta lo que RLS le deja ver. Antes
 * usaba service_role y contaba todo sin importar el rol.
 */
export async function getAdminSummary() {
  const supabase = await getSupabaseServerClient();

  const [{ count: vacancies }, { count: candidates }, { count: applications }] = await Promise.all([
    supabase.from("vacancies").select("id", { count: "exact", head: true }),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
  ]);

  return {
    vacancies: vacancies ?? 0,
    candidates: candidates ?? 0,
    applications: applications ?? 0,
  };
}
