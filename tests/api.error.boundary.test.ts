import { describe, expect, it } from "vitest";
import { z } from "zod";
import { errorResponse } from "@/lib/api/respond";
import { AppError, appErrors, isAppError } from "@/lib/errors";

async function readJson(response: Response) {
  return (await response.json()) as { error?: string; code?: string; correlationId?: string };
}

describe("errorResponse", () => {
  it("maps AppError to its declared status and message", async () => {
    const response = errorResponse(appErrors.duplicateApplication(), "test");
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(body.code).toBe("duplicate_application");
    expect(body.error).toContain("ya se postuló");
  });

  it("maps ZodError to 400 with the first issue", async () => {
    const schema = z.object({ email: z.string().email("Email inválido") });
    const parsed = schema.safeParse({ email: "no-es-un-email" });
    expect(parsed.success).toBe(false);

    const response = errorResponse(parsed.success ? null : parsed.error, "test");
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("validation_error");
  });

  it("NEVER leaks the message of an unexpected error", async () => {
    // Esto es exactamente lo que se filtraba antes: mensajes de PostgREST con
    // nombres de tablas, columnas y constraints.
    const leaky = new Error('duplicate key value violates unique constraint "candidates_email_key"');
    const response = errorResponse(leaky, "test");
    const body = await readJson(response);

    expect(response.status).toBe(500);
    expect(body.code).toBe("internal_error");
    expect(body.error).not.toContain("candidates_email_key");
    expect(body.error).not.toContain("constraint");
    expect(body.correlationId).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("does not leak messages of non-Error throwables either", async () => {
    const response = errorResponse({ secret: "service_role_key_abc" }, "test");
    const body = await readJson(response);

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("service_role_key_abc");
  });

  it("gives each unexpected error a distinct correlation id", async () => {
    const a = await readJson(errorResponse(new Error("x"), "test"));
    const b = await readJson(errorResponse(new Error("x"), "test"));

    expect(a.correlationId).not.toBe(b.correlationId);
  });
});

describe("AppError", () => {
  it("is detectable through isAppError", () => {
    expect(isAppError(appErrors.forbidden())).toBe(true);
    expect(isAppError(new Error("plain"))).toBe(false);
    expect(isAppError(null)).toBe(false);
  });

  it("exposes status and code for the response layer", () => {
    const error = new AppError("vacancy_closed", 409, "cerrada");
    expect(error.status).toBe(409);
    expect(error.code).toBe("vacancy_closed");
    expect(error).toBeInstanceOf(Error);
  });

  it("declares sensible statuses for each business error", () => {
    expect(appErrors.unauthorized().status).toBe(401);
    expect(appErrors.forbidden().status).toBe(403);
    expect(appErrors.vacancyNotFound().status).toBe(404);
    expect(appErrors.vacancyClosed().status).toBe(409);
    expect(appErrors.cvTooLarge().status).toBe(413);
    expect(appErrors.cvInvalidType().status).toBe(415);
  });
});
