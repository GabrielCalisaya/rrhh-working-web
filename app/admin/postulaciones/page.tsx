import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ApplicationsManager, type AdminApplicationItem } from "@/components/admin/ApplicationsManager";
import { PAGE_SIZE, Pagination, pageRange, parsePage } from "@/components/ui/Pagination";
import type { ApplicationStatus } from "@/lib/types";

type CandidateInfo = {
  full_name: string;
  email: string;
};

type VacancyInfo = {
  title: string;
};

type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  cv_file_path: string | null;
  applicant_full_name: string | null;
  candidates: CandidateInfo | CandidateInfo[] | null;
  vacancies: VacancyInfo | VacancyInfo[] | null;
};

function getSingleItem<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

export default async function AdminPostulacionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaffAccess();

  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  // RLS: "staff manage applications" + "staff read candidates" + "vacancies staff manage".
  const supabase = await getSupabaseServerClient();
  const { data: applicationsRaw, count } = await supabase
    .from("applications")
    .select("id,status,created_at,cv_file_path,applicant_full_name,vacancies(title),candidates(full_name,email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const applications = (applicationsRaw ?? []) as ApplicationRow[];
  const normalizedApplications: AdminApplicationItem[] = applications.map((application) => {
    const candidate = getSingleItem(application.candidates);
    const vacancy = getSingleItem(application.vacancies);

    return {
      id: application.id,
      status: application.status,
      vacancyTitle: vacancy?.title ?? "Vacante",
      // Se prioriza el nombre declarado en esta postulación sobre el de la ficha
      // del candidato, que queda congelado en su primera postulación.
      candidateName: application.applicant_full_name ?? candidate?.full_name ?? "Candidato",
      candidateEmail: candidate?.email ?? "",
      hasCv: Boolean(application.cv_file_path),
    };
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Postulaciones</h1>
      <ApplicationsManager initialApplications={normalizedApplications} />
      <Pagination basePath="/admin/postulaciones" page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
    </section>
  );
}
