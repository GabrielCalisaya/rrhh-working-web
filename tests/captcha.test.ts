import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assertCaptchaIsValid, isCaptchaEnabled } from "@/lib/security/captcha";
import { isAppError } from "@/lib/errors";

const originalEnabled = process.env.ENABLE_CAPTCHA;
const originalSecret = process.env.TURNSTILE_SECRET_KEY;

async function statusOf(promise: Promise<unknown>) {
  try {
    await promise;
    return "ok";
  } catch (error) {
    return isAppError(error) ? error.status : "unknown-error";
  }
}

describe("assertCaptchaIsValid", () => {
  beforeEach(() => {
    process.env.ENABLE_CAPTCHA = "true";
    process.env.TURNSTILE_SECRET_KEY = "secret-de-prueba";
  });

  afterEach(() => {
    process.env.ENABLE_CAPTCHA = originalEnabled;
    process.env.TURNSTILE_SECRET_KEY = originalSecret;
    vi.unstubAllGlobals();
  });

  it("is a no-op while the feature is off", async () => {
    process.env.ENABLE_CAPTCHA = "false";
    expect(isCaptchaEnabled()).toBe(false);
    await expect(assertCaptchaIsValid(undefined)).resolves.toBeUndefined();
  });

  it("rejects a missing token when enabled", async () => {
    expect(await statusOf(assertCaptchaIsValid(undefined))).toBe(400);
  });

  it("accepts a token that Turnstile validates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 })),
    );

    await expect(assertCaptchaIsValid("token-valido")).resolves.toBeUndefined();
  });

  it("rejects a token that Turnstile refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }))),
    );

    expect(await statusOf(assertCaptchaIsValid("token-falso"))).toBe(400);
  });

  it("FAILS CLOSED when the verifier is unreachable", async () => {
    // Un CAPTCHA que se saltea cuando el verificador no responde no sirve.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    expect(await statusOf(assertCaptchaIsValid("token-cualquiera"))).toBe(503);
  });

  it("fails closed when enabled but the secret is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(await statusOf(assertCaptchaIsValid("token"))).toBe(503);
  });

  it("never sends the secret in the query string", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetchMock);

    await assertCaptchaIsValid("token", "203.0.113.10");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain("secret-de-prueba");
    expect(init.method).toBe("POST");
    expect(String(init.body)).toContain("remoteip=203.0.113.10");
  });
});
