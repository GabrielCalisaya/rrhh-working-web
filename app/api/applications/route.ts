import { NextResponse } from "next/server";
import { z } from "zod";
import { applicationSchema } from "@/lib/validators/application";
import { createApplication } from "@/lib/services/applications";

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
