import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/security/rate-limit";

function req(headers: Record<string, string>) {
  return new Request("https://rrhhworking.com.ar/api/applications", { headers });
}

describe("getClientIp", () => {
  it("prefers the platform header the client cannot forge", () => {
    // Vercel descarta cualquier x-vercel-* que venga del cliente, así que esta
    // cabecera gana sobre x-forwarded-for, que sí es falsificable.
    const ip = getClientIp(
      req({
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "1.2.3.4",
        "x-real-ip": "5.6.7.8",
      }),
    );

    expect(ip).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip before x-forwarded-for", () => {
    expect(getClientIp(req({ "x-real-ip": "5.6.7.8", "x-forwarded-for": "1.2.3.4" }))).toBe("5.6.7.8");
  });

  it("uses x-forwarded-for only as a last resort", () => {
    expect(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });

  it("returns 'unknown' instead of throwing when there is no header", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });

  it("does not return an empty key that would collapse every client into one bucket", () => {
    expect(getClientIp(req({ "x-forwarded-for": "" }))).toBe("unknown");
    expect(getClientIp(req({ "x-vercel-forwarded-for": "  " }))).toBe("unknown");
  });
});
