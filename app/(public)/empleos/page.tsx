import { JobsFilterBar } from "@/components/jobs/JobsFilterBar";
import { listOpenVacancies } from "@/lib/services/vacancies";

export default async function EmpleosPage() {
  const vacancies = await listOpenVacancies().catch(() => []);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Empleos</h1>
      <p className="text-[var(--color-primary-dark)]">Filtrá vacantes por ciudad, modalidad, seniority o palabras clave.</p>
      <JobsFilterBar vacancies={vacancies} />
    </section>
  );
}
