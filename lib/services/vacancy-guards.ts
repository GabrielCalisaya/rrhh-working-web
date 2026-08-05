import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { appErrors } from "@/lib/errors";

export async function assertVacancyIsOpen(vacancyId: string) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("vacancies").select("id, status").eq("id", vacancyId).single();

  if (error || !data) {
    throw appErrors.vacancyNotFound();
  }

  if (data.status !== "open") {
    throw appErrors.vacancyClosed();
  }

  return data;
}
