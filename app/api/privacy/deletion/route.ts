import { NextResponse } from "next/server";
import { deletionRequestSchema, deletionResolutionSchema } from "@/lib/validators/privacy";
import {
  executeDataDeletion,
  getDeletionRequest,
  requestDataDeletion,
  resolveDeletionRequest,
} from "@/lib/services/privacy";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { assertCaptchaIsValid } from "@/lib/security/captcha";
import { requireStaffApi } from "@/lib/auth/api-guards";
import { recordAudit } from "@/lib/observability/audit";
import { errorResponse } from "@/lib/api/respond";

/**
 * POST — público. Un candidato solicita la baja de sus datos (Ley 25.326).
 * La solicitud queda pendiente; la ejecuta el staff desde el panel.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`deletion:${ip}`, 3, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intentá de nuevo más tarde.", code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const raw: unknown = await request.json();
    const captchaToken =
      typeof raw === "object" && raw !== null && "captchaToken" in raw && typeof raw.captchaToken === "string"
        ? raw.captchaToken
        : undefined;
    await assertCaptchaIsValid(captchaToken, ip);

    const payload = deletionRequestSchema.parse(raw);
    await requestDataDeletion(payload);

    await recordAudit({
      action: "deletion_request.created",
      targetType: "deletion_request",
      // El email no se guarda en metadata: ya está en deletion_requests y no
      // hace falta duplicar PII en la auditoría.
      metadata: { source: "public_form" },
    });

    // Respuesta idéntica exista o no el email: si no, este endpoint sería un
    // oráculo para averiguar quién se postuló.
    return NextResponse.json({
      message:
        "Recibimos tu solicitud. Vamos a procesarla y eliminar tus datos si están en nuestra base. Te contactaremos si necesitamos verificar algo.",
    });
  } catch (error) {
    return errorResponse(error, "POST /api/privacy/deletion");
  }
}

/**
 * PATCH — staff. Ejecuta o rechaza una solicitud pendiente.
 * "complete" borra de verdad: candidato, postulaciones, match_scores y los PDFs.
 */
export async function PATCH(request: Request) {
  try {
    const staff = await requireStaffApi();
    const payload = deletionResolutionSchema.parse(await request.json());

    const deletionRequest = await getDeletionRequest(payload.id);

    if (payload.action === "reject") {
      await resolveDeletionRequest(payload.id, "rejected", staff.userId, payload.notes);
      await recordAudit({
        action: "deletion_request.rejected",
        actorId: staff.userId,
        actorRole: staff.role,
        targetType: "deletion_request",
        targetId: payload.id,
        metadata: { notes: payload.notes || null },
      });

      return NextResponse.json({ data: { status: "rejected" } });
    }

    const outcome = await executeDataDeletion(deletionRequest.email);
    await resolveDeletionRequest(payload.id, "completed", staff.userId, payload.notes);

    await recordAudit({
      action: "candidate.deleted",
      actorId: staff.userId,
      actorRole: staff.role,
      targetType: "deletion_request",
      targetId: payload.id,
      metadata: {
        candidateFound: outcome.candidateFound,
        deletedCvCount: outcome.deletedCvCount,
      },
    });

    return NextResponse.json({ data: { status: "completed", ...outcome } });
  } catch (error) {
    return errorResponse(error, "PATCH /api/privacy/deletion");
  }
}
