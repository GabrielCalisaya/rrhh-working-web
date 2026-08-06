import Link from "next/link";
import { Input } from "@/components/ui/Input";
import type { VacancyFilters } from "@/lib/types";

type Facets = {
  cities: string[];
  modalities: string[];
  seniorities: string[];
};

type Props = {
  filters: VacancyFilters;
  facets: Facets;
  resultCount: number;
};

/**
 * Barra de filtros como formulario GET.
 *
 * Ahora es un Server Component: el estado vive en la URL, no en useState. Antes
 * los filtros eran estado de cliente, así que un resultado filtrado no se podía
 * compartir por link, no sobrevivía a un refresh y no era indexable — todo
 * relevante para un portal de empleos. Además el filtrado ocurre en Postgres,
 * no en memoria del navegador.
 *
 * Sin JavaScript también funciona: es un form nativo.
 */
export function JobsFilterBar({ filters, facets, resultCount }: Props) {
  const hasFilters = Boolean(filters.city || filters.modality || filters.seniority || filters.query);

  return (
    <form method="get" action="/empleos" className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label htmlFor="q" className="sr-only">
            Buscar por texto
          </label>
          <Input id="q" name="q" defaultValue={filters.query ?? ""} placeholder="Buscar por texto" />
        </div>

        <div>
          <label htmlFor="ciudad" className="sr-only">
            Ciudad
          </label>
          <select
            id="ciudad"
            name="ciudad"
            defaultValue={filters.city ?? ""}
            // text-base en mobile: evita el zoom automático de Safari en iOS al
            // enfocar el campo. Mismo criterio que en <Input />.
            className="min-h-11 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-text)] outline-none transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 md:min-h-10 md:text-sm"
          >
            <option value="">Todas las ciudades</option>
            {facets.cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modalidad" className="sr-only">
            Modalidad
          </label>
          <select
            id="modalidad"
            name="modalidad"
            defaultValue={filters.modality ?? ""}
            // text-base en mobile: evita el zoom automático de Safari en iOS al
            // enfocar el campo. Mismo criterio que en <Input />.
            className="min-h-11 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-text)] outline-none transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 md:min-h-10 md:text-sm"
          >
            <option value="">Todas las modalidades</option>
            {facets.modalities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="seniority" className="sr-only">
            Seniority
          </label>
          <select
            id="seniority"
            name="seniority"
            defaultValue={filters.seniority ?? ""}
            // text-base en mobile: evita el zoom automático de Safari en iOS al
            // enfocar el campo. Mismo criterio que en <Input />.
            className="min-h-11 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-text)] outline-none transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 md:min-h-10 md:text-sm"
          >
            <option value="">Todas las seniorities</option>
            {facets.seniorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center min-h-11 rounded-[var(--rw-radius-md)] bg-[var(--color-btn-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--color-btn-primary-fg)] shadow-[var(--rw-shadow-xs)] transition-[background-color,box-shadow] duration-[var(--rw-duration-fast)] hover:bg-[var(--color-btn-primary-bg-hover)] hover:shadow-[var(--rw-shadow-sm)] md:min-h-10"
        >
          Filtrar
        </button>

        {hasFilters ? (
          <Link href="/empleos" className="text-sm text-[var(--color-primary-dark)] hover:underline">
            Limpiar filtros
          </Link>
        ) : null}

        <p className="text-sm text-[var(--color-primary-dark)]" aria-live="polite">
          {resultCount === 1 ? "1 búsqueda abierta" : `${resultCount} búsquedas abiertas`}
        </p>
      </div>
    </form>
  );
}
