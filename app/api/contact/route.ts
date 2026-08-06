import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/respond";
import { assertCaptchaIsValid } from "@/lib/security/captcha";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import { isContactEmailConfigured, sendContactEmail } from "@/lib/services/contact-email";
import { contactSchema } from "@/lib/validators/contact";

/**
 * Alta de consultas del formulario de contacto.
 *
 * Reutiliza las tres defensas que el proyecto ya tenía montadas para las
 * postulaciones —límite por IP, Turnstile y validación con Zod en el servidor—
 * en vez de inventar un esquema propio. Suma el honeypot, que vive en el schema.
 *
 * El límite es de 3 envíos por hora por IP: una persona con una consulta real no
 * necesita más, y a un bot lo frena en seco.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        {
          error: "Ya recibimos varias consultas desde esta conexión. Probá de nuevo en un rato.",
          code: "rate_limited",
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const raw: unknown = await request.json();
    const captchaToken =
      typeof raw === "object" && raw !== null && "captchaToken" in raw && typeof raw.captchaToken === "string"
        ? raw.captchaToken
        : undefined;
    await assertCaptchaIsValid(captchaToken, ip);

    const payload = contactSchema.parse(raw);

    /**
     * Si falta la API key, se corta ANTES de responder que todo salió bien.
     * El peor resultado posible para un formulario de contacto es decirle a un
     * cliente potencial "recibimos tu consulta" cuando el mail nunca salió: esa
     * consulta se pierde y nadie se entera.
     */
    if (!isContactEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            "El envío de consultas no está disponible en este momento. Escribinos por email o WhatsApp.",
          code: "email_not_configured",
        },
        { status: 503 },
      );
    }

    await sendContactEmail(payload);

    return NextResponse.json(
      { message: "Recibimos tu consulta. Te vamos a responder a la brevedad." },
      { status: 201 },
    );
  } catch (error) {
    // errorResponse ya distingue ZodError (400), AppError y error inesperado
    // (500 genérico + correlationId, con el detalle sólo en el log).
    return errorResponse(error, "POST /api/contact");
  }
}
