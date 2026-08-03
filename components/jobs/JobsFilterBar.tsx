"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import type { Vacancy, VacancyFilters } from "@/lib/types";
import { filterVacancies } from "@/lib/utils/vacancies";
import { JobCard } from "@/components/jobs/JobCard";

function getUniqueValues<T extends keyof Vacancy>(vacancies: Vacancy[], key: T): Vacancy[T][] {
  return [...new Set(vacancies.map((item) => item[key]))];
}

export function JobsFilterBar({ vacancies }: { vacancies: Vacancy[] }) {
  const [filters, setFilters] = useState<VacancyFilters>({});

  const filtered = useMemo(() => filterVacancies(vacancies, filters), [vacancies, filters]);

  const cities = getUniqueValues(vacancies, "city");
  const modalities = getUniqueValues(vacancies, "modality");
  const seniorities = getUniqueValues(vacancies, "seniority");

  return (
    <section className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Buscar por texto"
          value={filters.query ?? ""}
          onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
        />

        <select
          className="rounded-md border border-[var(--color-accent)] bg-white px-3 py-2 text-sm"
          value={filters.city ?? ""}
          onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value || undefined }))}
        >
          <option value="">Todas las ciudades</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border border-[var(--color-accent)] bg-white px-3 py-2 text-sm"
          value={filters.modality ?? ""}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              modality: (event.target.value as Vacancy["modality"]) || undefined,
            }))
          }
        >
          <option value="">Todas las modalidades</option>
          {modalities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border border-[var(--color-accent)] bg-white px-3 py-2 text-sm"
          value={filters.seniority ?? ""}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              seniority: (event.target.value as Vacancy["seniority"]) || undefined,
            }))
          }
        >
          <option value="">Todas las seniorities</option>
          {seniorities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? <p className="text-sm">No se encontraron vacantes con esos filtros.</p> : null}
        {filtered.map((vacancy) => (
          <JobCard key={vacancy.id} vacancy={vacancy} />
        ))}
      </div>
    </section>
  );
}
