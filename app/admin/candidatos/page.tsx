import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PAGE_SIZE, Pagination, pageRange, parsePage } from "@/components/ui/Pagination";

export default async function AdminCandidatosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaffAccess();

  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  // Cliente con la sesión del usuario: RLS ("staff read candidates") decide.
  // `count: exact` acompaña a range() para poder mostrar el total.
  const supabase = await getSupabaseServerClient();
  const { data: candidates, count } = await supabase
    .from("candidates")
    .select("id,full_name,email,city,skills,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows = candidates ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Candidatos</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-primary-dark)]">
          {page > 1 ? "No hay candidatos en esta página." : "Todavía no hay candidatos."}
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((candidate) => (
            <article key={candidate.id} className="rounded-lg border border-[var(--color-accent)] bg-white p-4">
              <h2 className="font-semibold">{candidate.full_name}</h2>
              <p className="text-sm text-[var(--color-primary-dark)]">{candidate.email}</p>
              <p className="text-sm text-[var(--color-primary-dark)]">{candidate.city ?? "Sin ciudad"}</p>
              <p className="mt-2 text-xs">Skills: {(candidate.skills ?? []).join(", ") || "Sin definir"}</p>
            </article>
          ))}
        </div>
      )}

      <Pagination basePath="/admin/candidatos" page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
    </section>
  );
}
