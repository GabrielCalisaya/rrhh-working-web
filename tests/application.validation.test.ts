import { describe, expect, it } from "vitest";
import { applicationSchema } from "@/lib/validators/application";

describe("applicationSchema", () => {
  it("accepts valid payload", () => {
    const result = applicationSchema.safeParse({
      vacancyId: "10000000-0000-0000-0000-000000000001",
      candidate: {
        fullName: "Ana Pérez",
        email: "ana@test.com",
        phone: "11223344",
        city: "Córdoba",
        linkedinUrl: "https://linkedin.com/in/ana",
        portfolioUrl: "https://ana.dev",
        skills: ["React"],
        consent: true,
      },
      coverLetter: "Hola",
      cvFilePath: "cvs/ana.pdf",
    });

    expect(result.success).toBe(true);
  });

  it("rejects payload without consent", () => {
    const result = applicationSchema.safeParse({
      vacancyId: "10000000-0000-0000-0000-000000000001",
      candidate: {
        fullName: "Ana Pérez",
        email: "ana@test.com",
        skills: ["React"],
        consent: false,
      },
    });

    expect(result.success).toBe(false);
  });
});
