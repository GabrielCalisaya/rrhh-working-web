import type { Metadata } from "next";
import { JobsFilterBar } from "@/components/jobs/JobsFilterBar";
import { JobCard } from "@/components/jobs/JobCard";
import { listOpenVacanciesFiltered, listVacancyFacets } from "@/lib/services/vacancies";
import { logError } from "@/lib/observability/log";
import type { Vacancy, VacancyFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Empleos",
  description:
    "Búsquedas laborales abiertas. Difusión gratuita y voluntaria de oportunidades disponibles en Argentina. Filtrá por ciudad, modalidad y seniority.",
  openGraph: {
    title: "Empleos | RRHH Working",
    description: "Búsquedas laborales abiertas en Argentina. Postulate en línea.",
  },
};

const MODALITIES: Vacancy["modality"][] = ["Presencial", "Híbrido", "Remoto"];
const SENIORITIES: Vacancy["seniority"][] = ["Junior", "Semi Senior", "Senior", "Lead"];

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Los valores llegan de la query string, así que se validan contra la lista
 * cerrada antes de usarlos: si no, cualquiera podría inyectar un valor
 * arbitrario en el filtro.
 */
function parseFilters(params: Record<string, string | string[] | undefined>): VacancyFilters {
  const modality = first(params.modalidad);
  const seniority = first(params.seniority);

  return {
    city: first(params.ciudad),
    modality: MODALITIES.includes(modality as Vacancy["modality"]) ? (modality as Vacancy["modality"]) : undefined,
    seniority: SENIORITIES.includes(seniority as Vacancy["seniority"])
      ? (seniority as Vacancy["seniority"])
      : undefined,
    query: first(params.q)?.slice(0, 120),
  };
}

export default async function EmpleosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);

  const [vacancies, facets] = await Promise.all([
    listOpenVacanciesFiltered(filters).catch((error) => {
      logError("EmpleosPage.list", error);
      return [];
    }),
    listVacancyFacets().catch((error) => {
      logError("EmpleosPage.facets", error);
      return { cities: [], modalities: [], seniorities: [] };
    }),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">Empleos</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-primary-dark)]">
          Difusión gratuita y voluntaria de oportunidades laborales disponibles en Argentina. Filtrá por ciudad,
          modalidad, seniority o palabras clave.
        </p>
      </div>

      <JobsFilterBar filters={filters} facets={facets} resultCount={vacancies.length} />

      <div className="grid gap-4">
        {vacancies.length === 0 ? (
          <p className="rounded-lg border border-[var(--color-accent)] bg-white p-6 text-sm text-[var(--color-primary-dark)]">
            No se encontraron búsquedas con esos filtros. Probá quitando alguno.
          </p>
        ) : (
          vacancies.map((vacancy) => <JobCard key={vacancy.id} vacancy={vacancy} />)
        )}
      </div>
    </section>
  );
}
