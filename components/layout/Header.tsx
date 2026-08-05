import Image from "next/image";
import Link from "next/link";
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
 * Header estático. No resuelve la sesión en el servidor: eso lo hace <StaffNav />
 * en el cliente, para que las páginas públicas puedan generarse estáticamente.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-[var(--color-accent)] bg-[var(--color-background)]/95 px-4 py-5 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label={`${BRAND.name} — Inicio`}>
          {/* priority: el logo está en el viewport inicial de todas las páginas,
              así que no conviene que Next lo cargue en diferido. */}
          <Image
            src="/logo.png"
            alt=""
            width={56}
            height={56}
            priority
            className="h-12 w-12 shrink-0 md:h-14 md:w-14"
          />
          <span>
            <span className="block text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">
              {BRAND.location}
            </span>
            <span className="block text-2xl font-semibold text-[var(--color-text)] md:text-3xl">{BRAND.name}</span>
          </span>
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--color-primary-dark)]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-[var(--color-primary)]">
                  {item.label}
                </Link>
              </li>
            ))}
            <StaffNav />
          </ul>
        </nav>
      </div>
    </header>
  );
}
