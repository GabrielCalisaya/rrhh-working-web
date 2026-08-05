"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StaffNav } from "@/components/layout/StaffNav";
import { BRAND } from "@/lib/content/institucional";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Quiénes somos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/empleos", label: "Empleos" },
  { href: "/contacto", label: "Contacto" },
] as const;

/**
 * Header del sitio.
 *
 * Pasó a Client Component para resolver tres cosas que no se pueden resolver en
 * el servidor: el menú desplegable de mobile, el indicador de página activa y
 * la transición al hacer scroll.
 *
 * Esto NO vuelve dinámicas a las páginas: lo que fuerza render dinámico es leer
 * `cookies()` o `headers()`, no la directiva "use client". Las páginas públicas
 * se siguen generando estáticamente, igual que antes.
 *
 * La sesión se sigue resolviendo aparte en <StaffNav />, por el mismo motivo.
 */
export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // El menú se cierra solo al navegar. Sin esto queda abierto tapando la página
  // recién cargada, que es el error clásico de los menús mobile en SPA.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  /**
   * Estado "scrolleado" con IntersectionObserver sobre un sentinela de 1px, en
   * lugar de un listener de scroll.
   *
   * Un listener de scroll se ejecuta decenas de veces por segundo en el hilo
   * principal y es una fuente típica de jank en mobile. El observer sólo corre
   * cuando el sentinela cruza el borde del viewport: dos veces por sesión de
   * scroll, no dos mil.
   */
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Escape cierra el menú y devuelve el foco al botón, como corresponde a un
  // disclosure. Mientras está abierto se bloquea el scroll del fondo.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    /**
     * Al pasar a desktop el panel se oculta por CSS (md:hidden), pero el estado
     * seguiría en "abierto" y el scroll del body bloqueado: la página quedaba
     * congelada sin ningún menú visible que explicara por qué. Pasa al rotar el
     * teléfono a horizontal. El listener cierra el menú en ese cruce.
     */
    const desktop = window.matchMedia("(min-width: 768px)");
    const handleBreakpoint = () => {
      if (desktop.matches) setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleBreakpoint);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleBreakpoint);
    };
  }, [isOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Sentinela del observer. Va antes del header sticky en el flujo, así que
          deja de verse exactamente cuando el header se despega del tope. */}
      <div ref={sentinelRef} aria-hidden="true" className="-mb-px h-px" />

      <header
        className={`sticky top-0 z-30 -mx-4 border-b px-4 backdrop-blur transition-all duration-300 md:-mx-8 md:px-8 ${
          isScrolled
            ? "border-[var(--color-border)] bg-[var(--color-background)]/85 py-2.5 shadow-[var(--rw-shadow-sm)] md:py-3"
            : "border-transparent bg-[var(--color-background)]/95 py-4 md:py-5"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label={`${BRAND.name} — Inicio`}>
            {/* priority: el logo está en el viewport inicial de todas las páginas,
                así que no conviene que Next lo cargue en diferido. */}
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              priority
              className={`shrink-0 transition-all duration-300 ${
                isScrolled ? "h-9 w-9 md:h-11 md:w-11" : "h-10 w-10 md:h-14 md:w-14"
              }`}
            />
            <span className="min-w-0">
              {/* En mobile este renglón se oculta: son 12px en mayúsculas con
                  mucho tracking, poco legibles, y en un header sticky cada píxel
                  de alto se paga en todas las pantallas. */}
              <span className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-primary-dark)] sm:block">
                {BRAND.location}
              </span>
              <span
                className={`block truncate font-semibold text-[var(--color-text)] transition-all duration-300 ${
                  isScrolled ? "text-lg md:text-2xl" : "text-xl md:text-3xl"
                }`}
              >
                {BRAND.name}
              </span>
            </span>
          </Link>

          {/* --- Navegación desktop --- */}
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex flex-wrap items-center gap-1 text-sm font-medium text-[var(--color-primary-dark)]">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`relative block rounded-[var(--rw-radius-sm)] px-3 py-2 transition-colors duration-[var(--rw-duration-fast)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-primary-strong)] ${
                      isActive(item.href) ? "font-semibold text-[var(--color-primary-strong)]" : ""
                    }`}
                  >
                    {item.label}
                    {/* Subrayado del ítem activo. Va como elemento aparte y no
                        como border para que activarlo no desplace el texto. */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-[var(--color-primary)] transition-transform duration-[var(--rw-duration-base)] ${
                        isActive(item.href) ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              ))}
              <StaffNav />
            </ul>
          </nav>

          {/* --- Botón del menú mobile --- */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--rw-radius-md)] text-[var(--color-primary-strong)] transition-colors hover:bg-[var(--color-accent-soft)] md:hidden"
          >
            {/* Tres barras que se convierten en X. Se anima con transform, que el
                navegador resuelve en la GPU sin recalcular layout. */}
            <span aria-hidden="true" className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-transform duration-[var(--rw-duration-base)] ${
                  isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 rounded-full bg-current transition-opacity duration-[var(--rw-duration-fast)] ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-transform duration-[var(--rw-duration-base)] ${
                  isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>

        {/* --- Panel mobile ---
            Se anima con grid-template-rows de 0fr a 1fr: da una transición de
            altura suave sin necesidad de saber de antemano cuánto mide el
            contenido, que es lo que obliga a usar un max-height inventado.

            `inert` mientras está cerrado saca los enlaces del orden de
            tabulación y del árbol de accesibilidad. Sin eso, el teclado y el
            lector de pantalla siguen entrando a un menú que visualmente no
            existe. */}
        <div
          id="menu-mobile"
          inert={!isOpen}
          className={`grid overflow-hidden transition-[grid-template-rows] duration-[var(--rw-duration-base)] ease-[var(--rw-ease-emphasized)] md:hidden ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0">
            <nav aria-label="Principal" className="pb-2 pt-4">
              <ul className="flex flex-col gap-1 text-base font-medium text-[var(--color-primary-dark)]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      // py-3 sobre text-base deja el alto real en 48px, por
                      // encima del mínimo táctil de 44px (WCAG 2.5.5).
                      className={`flex items-center rounded-[var(--rw-radius-md)] px-3 py-3 transition-colors ${
                        isActive(item.href)
                          ? "bg-[var(--color-accent-soft)] font-semibold text-[var(--color-primary-strong)]"
                          : "hover:bg-[var(--color-accent-soft)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-2 border-t border-[var(--color-border)] pt-3">
                  <ul className="flex flex-wrap items-center gap-4 px-3 text-sm">
                    <StaffNav />
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
