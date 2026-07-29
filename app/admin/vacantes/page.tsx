import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";

export default async function AdminVacantesPage() {
  await requireStaffAccess();
  const supabase = getSupabaseServiceRoleClient();
  const { data: vacancies } = await supabase
    .from("vacancies")
    .select("id,title,city,status,modality,seniority,created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Vacantes</h1>
      <p className="text-sm text-[var(--color-primary-dark)]">Alta/edición se realiza vía /api/vacancies con validación por rol.</p>
      <div className="overflow-x-auto rounded-lg border border-[var(--color-accent)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-accent)]">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Modalidad</th>
              <th className="px-4 py-3">Seniority</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creada</th>
            </tr>
          </thead>
          <tbody>
            {(vacancies ?? []).map((vacancy) => (
              <tr key={vacancy.id} className="border-b border-[var(--color-accent)] last:border-0">
                <td className="px-4 py-3">{vacancy.title}</td>
                <td className="px-4 py-3">{vacancy.city}</td>
                <td className="px-4 py-3">{vacancy.modality}</td>
                <td className="px-4 py-3">{vacancy.seniority}</td>
                <td className="px-4 py-3">{vacancy.status}</td>
                <td className="px-4 py-3">{formatDate(vacancy.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
