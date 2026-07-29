import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

type CandidateInfo = {
  full_name: string;
  email: string;
};

type VacancyInfo = {
  title: string;
};

type ApplicationRow = {
  id: string;
  status: string;
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

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Postulaciones</h1>
      <p className="text-sm text-[var(--color-primary-dark)]">El cambio de estado se realiza vía API /api/applications (PATCH futuro).</p>
      <div className="grid gap-3">
        {applications.map((application) => {
          const candidate = getSingleItem(application.candidates);
          const vacancy = getSingleItem(application.vacancies);

          return (
            <article key={application.id} className="rounded-lg border border-[var(--color-accent)] bg-white p-4 text-sm">
              <p className="font-semibold">{vacancy?.title ?? "Vacante"}</p>
              <p>{candidate?.full_name ?? "Candidato"}</p>
              <p className="text-[var(--color-primary-dark)]">{candidate?.email ?? ""}</p>
              <p className="mt-1 uppercase tracking-wide text-[var(--color-primary-dark)]">Estado: {application.status}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
