import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { ApplicationsManager, type AdminApplicationItem } from "@/components/admin/ApplicationsManager";
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
  candidates: CandidateInfo | CandidateInfo[] | null;
  vacancies: VacancyInfo | VacancyInfo[] | null;
};

function getSingleItem<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

export default async function AdminPostulacionesPage() {
  await requireStaffAccess();
  const supabase = getSupabaseServiceRoleClient();
  const { data: applicationsRaw } = await supabase
    .from("applications")
    .select("id,status,created_at,vacancies(title),candidates(full_name,email)")
    .order("created_at", { ascending: false });

  const applications = (applicationsRaw ?? []) as ApplicationRow[];
  const normalizedApplications: AdminApplicationItem[] = applications.map((application) => {
    const candidate = getSingleItem(application.candidates);
    const vacancy = getSingleItem(application.vacancies);

    return {
      id: application.id,
      status: application.status,
      vacancyTitle: vacancy?.title ?? "Vacante",
      candidateName: candidate?.full_name ?? "Candidato",
      candidateEmail: candidate?.email ?? "",
    };
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Postulaciones</h1>
      <ApplicationsManager initialApplications={normalizedApplications} />
    </section>
  );
}
