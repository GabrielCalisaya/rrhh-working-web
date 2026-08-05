import { describe, expect, it } from "vitest";
import { resolveSafeNextPath } from "@/lib/security/redirect";

describe("resolveSafeNextPath", () => {
  it("accepts internal paths", () => {
    expect(resolveSafeNextPath("/admin/vacantes")).toBe("/admin/vacantes");
    expect(resolveSafeNextPath("/admin?tab=abiertas")).toBe("/admin?tab=abiertas");
    expect(resolveSafeNextPath("/admin#seccion")).toBe("/admin#seccion");
  });

  it("falls back when next is absent or empty", () => {
    expect(resolveSafeNextPath(null)).toBe("/admin");
    expect(resolveSafeNextPath(undefined)).toBe("/admin");
    expect(resolveSafeNextPath("")).toBe("/admin");
  });

  it("rejects the userinfo escape that made the original concatenation exploitable", () => {
    // `${origin}${next}` producía https://tu-dominio.com@evil.com
    expect(resolveSafeNextPath("@evil.com")).toBe("/admin");
    expect(resolveSafeNextPath("@evil.com/admin")).toBe("/admin");
  });

  it("rejects absolute and protocol-relative urls", () => {
    expect(resolveSafeNextPath("https://evil.com")).toBe("/admin");
    expect(resolveSafeNextPath("http://evil.com/admin")).toBe("/admin");
    expect(resolveSafeNextPath("//evil.com")).toBe("/admin");
    expect(resolveSafeNextPath("javascript:alert(1)")).toBe("/admin");
    expect(resolveSafeNextPath("data:text/html,<script>")).toBe("/admin");
  });

  it("rejects backslash and control-character tricks", () => {
    expect(resolveSafeNextPath("/\\evil.com")).toBe("/admin");
    expect(resolveSafeNextPath("/admin\\..\\evil")).toBe("/admin");
    expect(resolveSafeNextPath("/\nhttps://evil.com")).toBe("/admin");
    expect(resolveSafeNextPath("/\tadmin")).toBe("/admin");
  });

  it("honours a custom fallback", () => {
    expect(resolveSafeNextPath("https://evil.com", "/")).toBe("/");
  });
});
