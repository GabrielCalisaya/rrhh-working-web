import { describe, expect, it } from "vitest";
import { profileRoleUpdateSchema } from "@/lib/validators/profile";

describe("profileRoleUpdateSchema", () => {
  it("accepts admin role", () => {
    const result = profileRoleUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      role: "admin",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown role", () => {
    const result = profileRoleUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      role: "viewer",
    });

    expect(result.success).toBe(false);
  });
});
