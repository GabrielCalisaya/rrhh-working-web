import { NextResponse } from "next/server";
import { createVacancy, listOpenVacancies, updateVacancy } from "@/lib/services/vacancies";
import { vacancySchema, vacancyUpdateSchema } from "@/lib/validators/vacancy";
import { requireStaffApi } from "@/lib/auth/api-guards";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const vacancies = await listOpenVacancies();
    return NextResponse.json({ data: vacancies });
  } catch (error) {
    return errorResponse(error, "GET /api/vacancies");
  }
}

export async function POST(request: Request) {
  try {
    const staff = await requireStaffApi();
    const payload = vacancySchema.parse(await request.json());
    const vacancy = await createVacancy(payload, staff.userId);
    return NextResponse.json({ data: vacancy }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "POST /api/vacancies");
  }
}

export async function PATCH(request: Request) {
  try {
    await requireStaffApi();
    const payload = vacancyUpdateSchema.parse(await request.json());
    const vacancy = await updateVacancy(payload);
    return NextResponse.json({ data: vacancy });
  } catch (error) {
    return errorResponse(error, "PATCH /api/vacancies");
  }
}
