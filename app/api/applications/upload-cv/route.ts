import { NextResponse } from "next/server";
import { uploadCvFile } from "@/lib/services/applications";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo CV inválido" }, { status: 400 });
    }

    const path = await uploadCvFile(file);
    return NextResponse.json({ data: { path } }, { status: 201 });
  } catch (error) {
    const message = (error as Error).message;
    const status = message.includes("habilitada") || message.includes("permitido") || message.includes("PDF") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
