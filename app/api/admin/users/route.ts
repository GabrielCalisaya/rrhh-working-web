import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { profileRoleUpdateSchema } from "@/lib/validators/profile";
import { requireStaffApi } from "@/lib/auth/api-guards";
import { errorResponse } from "@/lib/api/respond";
import { recordAudit } from "@/lib/observability/audit";

export async function PATCH(request: Request) {
  try {
    const staff = await requireStaffApi(["admin"]);
    const payload = profileRoleUpdateSchema.parse(await request.json());

    // Cambiar roles con el cliente del usuario: RLS ("staff manage profiles",
    // solo admin) valida de nuevo lo que ya validó requireStaffApi(["admin"]).
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: payload.role })
      .eq("id", payload.id)
      .select("id,full_name,role,created_at")
      .single();

    if (error) {
      throw new Error(`profiles.update falló: ${error.message}`);
    }

    // Escalada de privilegios: es lo primero que se mira en un incidente.
    await recordAudit({
      action: "role.changed",
      actorId: staff.userId,
      actorRole: staff.role,
      targetType: "profile",
      targetId: payload.id,
      metadata: { newRole: payload.role },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error, "PATCH /api/admin/users");
  }
}
