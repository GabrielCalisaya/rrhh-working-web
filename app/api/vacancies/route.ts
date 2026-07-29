import { NextResponse } from "next/server";
import { z } from "zod";
import { createVacancy, listOpenVacancies, updateVacancy } from "@/lib/services/vacancies";
import { vacancySchema, vacancyUpdateSchema } from "@/lib/validators/vacancy";
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

export async function GET() {
  try {
    const vacancies = await listOpenVacancies();
    return NextResponse.json({ data: vacancies });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserRole();
    if (!currentUser || !currentUser.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "recruiter"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = vacancySchema.parse(await request.json());
    const vacancy = await createVacancy(payload, currentUser.userId);
    return NextResponse.json({ data: vacancy }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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

    const payload = vacancyUpdateSchema.parse(await request.json());
    const vacancy = await updateVacancy(payload);
    return NextResponse.json({ data: vacancy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
