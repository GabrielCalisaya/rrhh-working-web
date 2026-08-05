import { requireStaffAccess } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { UsersRolesManager } from "@/components/admin/UsersRolesManager";
import type { AppRole } from "@/lib/types";

export default async function AdminUsuariosPage() {
  await requireStaffAccess(["admin"]);
  // RLS: "staff manage profiles" solo deja a admin ver todos los perfiles.
  const supabase = await getSupabaseServerClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,full_name,role,created_at")
    .order("created_at")
    .limit(200);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="text-sm text-[var(--color-primary-dark)]">Solo admins pueden gestionar roles.</p>
      <UsersRolesManager
        initialProfiles={(profiles ?? []).map((profile) => ({
          id: profile.id,
          full_name: profile.full_name,
          role: profile.role as AppRole,
        }))}
      />
    </section>
  );
}
