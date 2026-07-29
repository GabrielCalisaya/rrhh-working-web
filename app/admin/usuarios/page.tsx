import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminUsuariosPage() {
  await requireStaffAccess(["admin"]);
  const supabase = getSupabaseServiceRoleClient();
  const { data: profiles } = await supabase.from("profiles").select("id,full_name,role,created_at").order("created_at");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="text-sm text-[var(--color-primary-dark)]">Solo admins pueden gestionar roles. Esta vista lista perfiles existentes.</p>
      <div className="overflow-x-auto rounded-lg border border-[var(--color-accent)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-accent)]">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile) => (
              <tr key={profile.id} className="border-b border-[var(--color-accent)] last:border-0">
                <td className="px-4 py-3 text-xs">{profile.id}</td>
                <td className="px-4 py-3">{profile.full_name}</td>
                <td className="px-4 py-3">{profile.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
