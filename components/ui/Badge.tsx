import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    // El par de colores es propio del badge y no reusa el del texto de párrafo:
    // sobre `--color-accent` el texto quedaba en 3.04:1. Bajar el fondo a
    // `--color-accent-soft` y subir el texto a `--color-primary-strong` da
    // 5.14:1 sin oscurecer el token global, que habría afectado a todo el sitio.
    <span className="inline-flex rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary-strong)]">
      {children}
    </span>
  );
}
