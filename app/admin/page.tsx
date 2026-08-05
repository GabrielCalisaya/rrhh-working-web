import Link from "next/link";
import { requireStaffAccess } from "@/lib/auth/guards";
import { Card } from "@/components/ui/Card";
import { getAdminSummary } from "@/lib/admin-data";
import { logError } from "@/lib/observability/log";

export default async function AdminPage() {
  await requireStaffAccess();
  // Un fallo de base se veía como un dashboard de ceros, indistinguible de un
  // sistema vacío y sin ningún rastro. Al menos queda registrado.
  const summary = await getAdminSummary().catch((error) => {
    logError("AdminPage.getAdminSummary", error);
    return { vacancies: 0, candidates: 0, applications: 0 };
  });

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Panel Admin</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-[var(--color-primary)]">
          <p className="text-sm text-[var(--color-primary-dark)]">Vacantes</p>
          <p className="text-3xl font-semibold">{summary.vacancies}</p>
        </Card>
        <Card className="border-l-4 border-l-[var(--color-primary-dark)]">
          <p className="text-sm text-[var(--color-primary-dark)]">Candidatos</p>
          <p className="text-3xl font-semibold">{summary.candidates}</p>
        </Card>
        <Card className="border-l-4 border-l-[var(--color-accent)]">
          <p className="text-sm text-[var(--color-primary-dark)]">Postulaciones</p>
          <p className="text-3xl font-semibold">{summary.applications}</p>
        </Card>
      </div>
    </section>
  );
}
