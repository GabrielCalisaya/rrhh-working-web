import type { Vacancy, VacancyFilters } from "@/lib/types";

/**
 * Filtrado en memoria.
 *
 * Ya no lo usa la aplicación: /empleos filtra en Postgres con
 * listOpenVacanciesFiltered(). Se conserva como referencia del criterio de
 * filtrado y porque sus tests documentan el comportamiento esperado.
 */
export function filterVacancies(vacancies: Vacancy[], filters: VacancyFilters): Vacancy[] {
  return vacancies.filter((vacancy) => {
    if (filters.city && vacancy.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.modality && vacancy.modality !== filters.modality) {
      return false;
    }

    if (filters.seniority && vacancy.seniority !== filters.seniority) {
      return false;
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchable = `${vacancy.title} ${vacancy.description} ${vacancy.requirements.join(" ")}`.toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }

    return true;
  });
}
