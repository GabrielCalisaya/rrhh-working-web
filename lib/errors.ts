/**
 * Frontera de errores de la aplicación.
 *
 * Antes, los servicios propagaban `error.message` de PostgREST y las rutas lo
 * devolvían tal cual con status 500, filtrando nombres de tablas, columnas y
 * constraints. Peor: el código HTTP se derivaba con `message.includes("...")`
 * sobre el texto en español, así que reescribir un mensaje cambiaba el
 * comportamiento de la API en silencio.
 *
 * Regla: solo los `AppError` —errores de negocio, con código y status
 * explícitos— llegan al cliente con su mensaje. Todo lo demás se registra en el
 * servidor y sale como error genérico con un id de correlación.
 */

export type AppErrorCode =
  | "vacancy_not_found"
  | "vacancy_closed"
  | "duplicate_application"
  | "invalid_cv_reference"
  | "cv_upload_disabled"
  | "cv_too_large"
  | "cv_invalid_type"
  | "candidate_persist_failed"
  | "captcha_failed"
  | "cv_not_found"
  | "deletion_request_not_found"
  | "unauthorized"
  | "forbidden";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Errores esperados, con mensaje apto para mostrar al usuario final. */
export const appErrors = {
  vacancyNotFound: () => new AppError("vacancy_not_found", 404, "Vacante no encontrada"),
  vacancyClosed: () => new AppError("vacancy_closed", 409, "Esta vacante no acepta postulaciones"),
  duplicateApplication: () =>
    new AppError("duplicate_application", 409, "La persona ya se postuló a esta vacante"),
  invalidCvReference: () =>
    new AppError("invalid_cv_reference", 400, "El CV indicado no existe o no es válido"),
  cvUploadDisabled: () => new AppError("cv_upload_disabled", 403, "La carga de CV no está habilitada"),
  cvTooLarge: () => new AppError("cv_too_large", 413, "El CV supera el tamaño máximo permitido (5MB)"),
  cvInvalidType: () => new AppError("cv_invalid_type", 415, "Solo se permiten archivos PDF"),
  unauthorized: () => new AppError("unauthorized", 401, "Necesitás iniciar sesión"),
  forbidden: () => new AppError("forbidden", 403, "No tenés permisos para esta acción"),
} as const;
