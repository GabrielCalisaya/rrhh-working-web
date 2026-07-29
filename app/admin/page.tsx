import Link from "next/link";
import { requireStaffAccess } from "@/lib/auth/guards";
import { Card } from "@/components/ui/Card";
import { getAdminSummary } from "@/lib/admin-data";

export default async function AdminPage() {
  await requireStaffAccess();
  const summary = await getAdminSummary().catch(() => ({ vacancies: 0, candidates: 0, applications: 0 }));

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Panel Admin</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-primary-dark)]">Vacantes</p>
          <p className="text-3xl font-semibold">{summary.vacancies}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-primary-dark)]">Candidatos</p>
          <p className="text-3xl font-semibold">{summary.candidates}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-primary-dark)]">Postulaciones</p>
          <p className="text-3xl font-semibold">{summary.applications}</p>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3 text-sm font-medium text-[var(--color-primary-dark)]">
        <Link href="/admin/vacantes" className="underline">
          Gestionar vacantes
        </Link>
        <Link href="/admin/candidatos" className="underline">
          Ver candidatos
        </Link>
        <Link href="/admin/postulaciones" className="underline">
          Gestionar postulaciones
        </Link>
        <Link href="/admin/usuarios" className="underline">
          Gestionar usuarios
        </Link>
      </div>
    </section>
  );
}
