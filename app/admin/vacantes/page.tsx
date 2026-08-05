import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapVacancyRow } from "@/lib/services/vacancies";
import { VacanciesManager } from "@/components/admin/VacanciesManager";
import { PAGE_SIZE, Pagination, pageRange, parsePage } from "@/components/ui/Pagination";

export default async function AdminVacantesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaffAccess();

  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  // RLS: "vacancies staff manage".
  const supabase = await getSupabaseServerClient();
  const { data, count } = await supabase
    .from("vacancies")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const vacancies = (data ?? []).map((item) => mapVacancyRow(item));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Vacantes</h1>
      <VacanciesManager initialVacancies={vacancies} />
      <Pagination basePath="/admin/vacantes" page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
    </section>
  );
}
