import { describe, expect, it } from "vitest";
import { applicationSchema } from "@/lib/validators/application";

describe("applicationSchema", () => {
  it("accepts valid payload", () => {
    const result = applicationSchema.safeParse({
      vacancyId: "550e8400-e29b-41d4-a716-446655440000",
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
      // La ruta debe respetar `^cvs/[0-9a-f-]+\.pdf$`: es un UUID generado por el
      // servidor, no un nombre libre. "cvs/ana.pdf" no valida.
      cvFilePath: "cvs/550e8400-e29b-41d4-a716-446655440000.pdf",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a cv path that is not a server-generated uuid", () => {
    const result = applicationSchema.safeParse({
      vacancyId: "550e8400-e29b-41d4-a716-446655440000",
      candidate: {
        fullName: "Ana Pérez",
        email: "ana@test.com",
        skills: ["React"],
        consent: true,
      },
      cvFilePath: "cvs/../../secret.pdf",
    });

    expect(result.success).toBe(false);
  });

  it("rejects payload without consent", () => {
    const result = applicationSchema.safeParse({
      vacancyId: "550e8400-e29b-41d4-a716-446655440000",
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
