import { NextResponse } from "next/server";
import { z } from "zod";
import { isAppError } from "@/lib/errors";
import { logError } from "@/lib/observability/log";

const GENERIC_MESSAGE = "Ocurrió un error inesperado. Volvé a intentarlo en unos minutos.";

type ErrorContext = Record<string, unknown>;

/**
 * Única salida de error de las rutas API.
 *
 * - ZodError            -> 400 con el primer issue (ya es texto para el usuario).
 * - AppError            -> status y mensaje declarados en el propio error.
 * - cualquier otra cosa -> se registra en el servidor con contexto completo y
 *                          sale como 500 genérico + correlationId.
 *
 * Nunca se devuelve `error.message` de un error no controlado: ahí es donde
 * viajaban los nombres de tablas y constraints de PostgREST.
 */
export function errorResponse(error: unknown, scope: string, context: ErrorContext = {}) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Payload inválido", code: "validation_error" },
      { status: 400 },
    );
  }

  if (isAppError(error)) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  const correlationId = logError(scope, error, context);

  return NextResponse.json(
    { error: GENERIC_MESSAGE, code: "internal_error", correlationId },
    { status: 500 },
  );
}
