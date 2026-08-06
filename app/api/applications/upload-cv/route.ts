import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadCvFile } from "@/lib/services/applications";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { errorResponse } from "@/lib/api/respond";

const uploadSchema = z.object({
  vacancyId: z.string().uuid(),
});

/**
 * Subida del CV.
 *
 * ESTE ENDPOINT NO VALIDA CAPTCHA, A PROPÓSITO.
 *
 * Un token de Turnstile se emite por INTERACCIÓN de la persona, no por
 * petición HTTP, y se invalida en la primera verificación. Como enviar una
 * postulación con CV son dos llamadas (subir el archivo y crear la
 * postulación), pedir captcha en las dos obligaba a reiniciar el widget en
 * medio del envío para conseguir un segundo token. Eso volvía el flujo frágil
 * —cada reinicio es una espera que puede fallar o vencer— y confuso, porque la
 * verificación se reiniciaba sola al tocar "Enviar".
 *
 * Ahora el captcha se valida UNA vez, en POST /api/applications, que es donde
 * se crea el dato. Esta ruta se apoya en las defensas que le corresponden:
 *
 *  - Límite por IP (10 subidas por hora).
 *  - Tipo y tamaño verificados, incluida la firma binaria del PDF (isPdfBuffer),
 *    así que no alcanza con renombrar un archivo.
 *  - La vacante tiene que existir y estar abierta.
 *  - El archivo subido no sirve de nada por sí solo: queda sin referencia hasta
 *    que una postulación válida —esa sí con captcha— lo enlace.
 *
 * El riesgo residual es que alguien con IP rotativa deje archivos huérfanos,
 * acotado a 10 por hora y limpiable. A cambio, el flujo de postulación deja de
 * depender de dos verificaciones encadenadas.
 */
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
