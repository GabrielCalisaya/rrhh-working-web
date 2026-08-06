import Link from "next/link";

export const PAGE_SIZE = 25;

type Props = {
  basePath: string;
  page: number;
  total: number;
  pageSize?: number;
};

/** Convierte `?page=` de la query string en un número de página válido (1-based). */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** Rango [from, to] para `.range()` de PostgREST. */
export function pageRange(page: number, pageSize: number = PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function Pagination({ basePath, page, total, pageSize = PAGE_SIZE }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 pt-2" aria-label="Paginación">
      <p className="text-sm text-[var(--color-primary-dark)]">
        {first}–{last} de {total}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={`${basePath}?page=${page - 1}`}
            rel="prev"
            className="inline-flex min-h-11 items-center rounded-[var(--rw-radius-md)] border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors duration-[var(--rw-duration-fast)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-primary-strong)] md:min-h-10"
          >
            Anterior
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-[var(--rw-radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm md:min-h-10 text-[var(--color-text-muted)] opacity-60">
            Anterior
          </span>
        )}

        <span className="text-sm text-[var(--color-primary-dark)]">
          Página {page} de {totalPages}
        </span>

        {page < totalPages ? (
          <Link
            href={`${basePath}?page=${page + 1}`}
            rel="next"
            className="inline-flex min-h-11 items-center rounded-[var(--rw-radius-md)] border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors duration-[var(--rw-duration-fast)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-primary-strong)] md:min-h-10"
          >
            Siguiente
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-[var(--rw-radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm md:min-h-10 text-[var(--color-text-muted)] opacity-60">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
