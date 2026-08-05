import { NextResponse } from "next/server";
import { applicationSchema, applicationStatusUpdateSchema } from "@/lib/validators/application";
import { createApplication, updateApplicationStatus } from "@/lib/services/applications";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { assertCaptchaIsValid } from "@/lib/security/captcha";
import { requireStaffApi } from "@/lib/auth/api-guards";
import { recordAudit } from "@/lib/observability/audit";
import { errorResponse } from "@/lib/api/respond";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`applications:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Demasiadas postulaciones. Intentá de nuevo más tarde.", code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const raw: unknown = await request.json();
    const captchaToken =
      typeof raw === "object" && raw !== null && "captchaToken" in raw && typeof raw.captchaToken === "string"
        ? raw.captchaToken
        : undefined;
    await assertCaptchaIsValid(captchaToken, ip);

    // Zod descarta captchaToken: no forma parte del modelo de postulación.
    const payload = applicationSchema.parse(raw);
    const application = await createApplication(payload);
    return NextResponse.json({ data: application, message: "Postulación enviada correctamente" }, { status: 201 });
  } catch (error) {
    // El status ya no se deduce de substrings del mensaje: lo declara el AppError.
    return errorResponse(error, "POST /api/applications");
  }
}

export async function PATCH(request: Request) {
  try {
    const staff = await requireStaffApi();
    const payload = applicationStatusUpdateSchema.parse(await request.json());
    const application = await updateApplicationStatus(payload);

    await recordAudit({
      action: "application.status_changed",
      actorId: staff.userId,
      actorRole: staff.role,
      targetType: "application",
      targetId: payload.id,
      metadata: { newStatus: payload.status },
    });

    return NextResponse.json({ data: application });
  } catch (error) {
    return errorResponse(error, "PATCH /api/applications");
  }
}
