import "server-only";

import { logError } from "@/lib/observability/log";
import { AppError } from "@/lib/errors";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isCaptchaEnabled(): boolean {
  return process.env.ENABLE_CAPTCHA === "true";
}

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/**
 * Verifica un token de Cloudflare Turnstile contra la API de siteverify.
 *
 * A diferencia del rate limiting, esto falla CERRADO: si no se puede verificar
 * el token, se rechaza el request. Un CAPTCHA que se saltea cuando el
 * verificador no responde no es un CAPTCHA.
 */
export async function assertCaptchaIsValid(token: string | undefined, remoteIp?: string): Promise<void> {
  if (!isCaptchaEnabled()) {
    return;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    logError("captcha.config", new Error("ENABLE_CAPTCHA=true pero falta TURNSTILE_SECRET_KEY"));
    throw new AppError("captcha_failed", 503, "Verificación no disponible. Intentá de nuevo más tarde.");
  }

  if (!token) {
    throw new AppError("captcha_failed", 400, "Completá la verificación anti-spam.");
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  let result: TurnstileResponse;
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5000),
    });
    result = (await response.json()) as TurnstileResponse;
  } catch (error) {
    logError("captcha.verify", error);
    throw new AppError("captcha_failed", 503, "No se pudo verificar. Intentá de nuevo en unos minutos.");
  }

  if (!result.success) {
    logError("captcha.rejected", new Error(`Turnstile rechazó el token: ${(result["error-codes"] ?? []).join(", ")}`));
    throw new AppError("captcha_failed", 400, "La verificación anti-spam falló. Recargá la página e intentá de nuevo.");
  }
}
