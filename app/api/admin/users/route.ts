import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { profileRoleUpdateSchema } from "@/lib/validators/profile";
import type { AppRole } from "@/lib/types";

async function getCurrentUserRole() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { userId: user.id, role: (profile?.role as AppRole | null) ?? null };
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUserRole();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = profileRoleUpdateSchema.parse(await request.json());
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: payload.role })
      .eq("id", payload.id)
      .select("id,full_name,role,created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
