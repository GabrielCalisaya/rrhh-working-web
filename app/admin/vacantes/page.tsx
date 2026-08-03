import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { mapVacancyRow } from "@/lib/services/vacancies";
import { VacanciesManager } from "@/components/admin/VacanciesManager";

export default async function AdminVacantesPage() {
  await requireStaffAccess();
  const supabase = getSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("vacancies")
    .select("*")
    .order("created_at", { ascending: false });
  const vacancies = (data ?? []).map((item) => mapVacancyRow(item));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Vacantes</h1>
      <VacanciesManager initialVacancies={vacancies} />
    </section>
  );
}
