import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/api-guards";
import { createCvSignedUrl } from "@/lib/services/cv";
import { errorResponse } from "@/lib/api/respond";
import { recordAudit } from "@/lib/observability/audit";

const querySchema = z.object({
  applicationId: z.string().uuid(),
});

/**
 * Emite una URL firmada de 60 segundos para descargar el CV de una postulación.
 * Solo staff autenticado. La ruta del archivo se resuelve en el servidor desde
 * la postulación: el cliente nunca la elige.
 */
export async function GET(request: Request) {
  try {
    const staff = await requireStaffApi();

    const { searchParams } = new URL(request.url);
    const { applicationId } = querySchema.parse({
      applicationId: searchParams.get("applicationId"),
    });

    const url = await createCvSignedUrl(applicationId);

    // Acceso a PII: queda registrado quién descargó qué y cuándo.
    await recordAudit({
      action: "cv.downloaded",
      actorId: staff.userId,
      actorRole: staff.role,
      targetType: "application",
      targetId: applicationId,
    });

    return NextResponse.json({ data: { url } });
  } catch (error) {
    return errorResponse(error, "GET /api/applications/cv");
  }
}
