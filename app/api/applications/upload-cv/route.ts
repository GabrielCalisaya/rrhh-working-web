import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadCvFile } from "@/lib/services/applications";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { assertCaptchaIsValid } from "@/lib/security/captcha";
import { errorResponse } from "@/lib/api/respond";

const uploadSchema = z.object({
  vacancyId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`upload-cv:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos de carga. Intentá de nuevo más tarde.", code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const vacancyId = String(formData.get("vacancyId") ?? "");
    const captchaToken = formData.get("captchaToken");

    await assertCaptchaIsValid(typeof captchaToken === "string" ? captchaToken : undefined, ip);

    uploadSchema.parse({ vacancyId });

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo CV inválido", code: "validation_error" }, { status: 400 });
    }

    const path = await uploadCvFile(file, vacancyId);
    return NextResponse.json({ data: { path } }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "POST /api/applications/upload-cv");
  }
}
