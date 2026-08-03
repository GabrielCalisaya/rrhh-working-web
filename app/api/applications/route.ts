import { NextResponse } from "next/server";
import { z } from "zod";
import { applicationSchema, applicationStatusUpdateSchema } from "@/lib/validators/application";
import { createApplication, updateApplicationStatus } from "@/lib/services/applications";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

export async function POST(request: Request) {
  try {
    const payload = applicationSchema.parse(await request.json());
    const application = await createApplication(payload);
    return NextResponse.json({ data: application, message: "Postulación enviada correctamente" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
    }

    const message = (error as Error).message;
    const status = message.includes("ya se postuló") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUserRole();
    if (!currentUser || !currentUser.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "recruiter"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = applicationStatusUpdateSchema.parse(await request.json());
    const application = await updateApplicationStatus(payload);
    return NextResponse.json({ data: application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
