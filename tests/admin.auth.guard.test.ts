import { describe, expect, it } from "vitest";
import { hasRequiredRole } from "@/lib/auth/guards";

describe("hasRequiredRole", () => {
  it("returns true for matching roles", () => {
    expect(hasRequiredRole("admin", ["admin"])).toBe(true);
  });

  it("returns false for missing role", () => {
    expect(hasRequiredRole(null, ["admin", "recruiter"])).toBe(false);
  });
});
