import { describe, expect, it } from "vitest";
import { applicationStatusUpdateSchema } from "@/lib/validators/application";

describe("applicationStatusUpdateSchema", () => {
  it("accepts valid status update payload", () => {
    const result = applicationStatusUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "review",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = applicationStatusUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "pending",
    });

    expect(result.success).toBe(false);
  });
});
