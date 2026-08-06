import Link from "next/link";
import { requireStaffAccess } from "@/lib/auth/guards";
import { getStaffSession } from "@/lib/auth/session";

type AdminLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const ADMIN_LINKS: readonly AdminLink[] = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/vacantes", label: "Vacantes" },
  { href: "/admin/candidatos", label: "Candidatos" },
  { href: "/admin/postulaciones", label: "Postulaciones" },
  { href: "/admin/privacidad", label: "Bajas de datos" },
  { href: "/admin/usuarios", label: "Usuarios", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaffAccess();
  const session = await getStaffSession();

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm lg:sticky lg:top-28">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-dark)]">Panel admin</p>
        <p className="mt-1 text-sm font-semibold">{session?.fullName ?? "Staff"}</p>
        <p className="text-xs capitalize text-[var(--color-primary-dark)]">{session?.role ?? "sin rol"}</p>
        <nav className="mt-4 grid gap-1" aria-label="Admin">
          {ADMIN_LINKS.filter((link) => !link.adminOnly || session?.role === "admin").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-primary-dark)] transition-colors hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
