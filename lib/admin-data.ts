import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function getAdminSummary() {
  const supabase = getSupabaseServiceRoleClient();

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
