"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

/** `startViewTransition` todavía no está en los tipos DOM de todos los TS. */
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

/**
 * Selector de tema.
 *
 * Detalle de implementación importante: los dos íconos se renderizan SIEMPRE, y
 * cuál se ve lo decide el CSS según `data-theme` en <html> (ver globals.css).
 *
 * El camino obvio sería `{theme === "dark" ? <Sol/> : <Luna/>}`, pero el
 * servidor no sabe qué tema eligió el usuario: renderizaría siempre el de modo
 * claro y React avisaría de un desajuste de hidratación, además de mostrar el
 * ícono equivocado durante un instante. Resolviéndolo por CSS, el HTML del
 * servidor es válido para ambos temas y el ícono correcto aparece desde el
 * primer pintado, incluso antes de que hidrate el JavaScript.
 *
 * Por eso mismo la etiqueta accesible es fija ("Cambiar tema") en vez de
 * "Cambiar a modo oscuro": una etiqueta variable volvería a introducir el
 * desajuste que estamos evitando.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // El script del layout ya aplicó el tema antes del primer pintado. Acá sólo
    // se sincroniza el estado de React con lo que quedó en el DOM.
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";

    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Modo incógnito o almacenamiento bloqueado: el tema igual se aplica
        // en esta sesión, sólo no se recuerda para la próxima.
      }
    };

    /**
     * View Transitions hace un fundido entre ambos temas en lugar del cambio
     * brusco. Es progresivo: donde no está soportado, el tema cambia igual, sin
     * animación. No se usa si la persona pidió reducir el movimiento.
     */
    const doc = document as DocumentWithViewTransition;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof doc.startViewTransition === "function" && !prefersReduced) {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      title="Cambiar tema"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--rw-radius-md)] text-[var(--color-primary-dark)] transition-colors duration-[var(--rw-duration-fast)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-primary-strong)] md:h-9 md:w-9"
    >
      <Icon name="moon" className="rw-icon-moon h-[18px] w-[18px]" />
      <Icon name="sun" className="rw-icon-sun h-5 w-5" />
    </button>
  );
}
