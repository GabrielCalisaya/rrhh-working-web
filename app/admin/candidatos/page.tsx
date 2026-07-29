import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminCandidatosPage() {
  await requireStaffAccess();
  const supabase = getSupabaseServiceRoleClient();
  const { data: candidates } = await supabase
    .from("candidates")
    .select("id,full_name,email,city,skills,created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Candidatos</h1>
      <div className="grid gap-3">
        {(candidates ?? []).map((candidate) => (
          <article key={candidate.id} className="rounded-lg border border-[var(--color-accent)] bg-white p-4">
            <h2 className="font-semibold">{candidate.full_name}</h2>
            <p className="text-sm text-[var(--color-primary-dark)]">{candidate.email}</p>
            <p className="text-sm text-[var(--color-primary-dark)]">{candidate.city ?? "Sin ciudad"}</p>
            <p className="mt-2 text-xs">Skills: {(candidate.skills ?? []).join(", ") || "Sin definir"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
