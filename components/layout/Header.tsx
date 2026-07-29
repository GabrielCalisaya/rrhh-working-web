import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/empleos", label: "Empleos" },
  { href: "/contacto", label: "Contacto" },
  { href: "/admin", label: "Admin" },
] as const;

export function Header() {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--color-accent)] py-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">Argentina</p>
        <Link href="/" className="text-3xl font-semibold text-[var(--color-text)]">
          RRHH Working
        </Link>
      </div>
      <nav>
        <ul className="flex flex-wrap gap-4 text-sm font-medium text-[var(--color-primary-dark)]">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-[var(--color-primary)]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
