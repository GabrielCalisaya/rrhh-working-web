type LogContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { name: "UnknownError", message: String(error) };
}

/**
 * Registra un error inesperado del lado del servidor y devuelve un id de
 * correlación para mostrarle al usuario.
 *
 * El detalle (mensaje de PostgREST, stack, contexto) queda en el log; al
 * cliente solo le llega el id. Salida en JSON de una línea para que sea
 * parseable por Vercel Logs o cualquier colector.
 */
export function logError(scope: string, error: unknown, context: LogContext = {}): string {
  const correlationId = crypto.randomUUID();

  console.error(
    JSON.stringify({
      level: "error",
      scope,
      correlationId,
      timestamp: new Date().toISOString(),
      error: serializeError(error),
      ...context,
    }),
  );

  return correlationId;
}

/**
 * Registra un evento de auditoría: quién hizo qué sobre datos sensibles.
 *
 * Separado de logError a propósito. Descargar el CV de un candidato no es un
 * error, pero sí es un acceso a PII que hay que poder reconstruir después.
 */
export function logAudit(action: string, context: LogContext = {}): void {
  console.info(
    JSON.stringify({
      level: "audit",
      action,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
}
