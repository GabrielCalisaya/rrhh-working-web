import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { uploadCvFile } from "@/lib/services/applications";

// Ambos casos fallan antes de tocar Supabase (feature flag y tipo de archivo se
// validan al inicio de uploadCvFile), así que el vacancyId nunca llega a usarse.
const VACANCY_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("uploadCvFile", () => {
  const originalEnableCvUpload = process.env.ENABLE_CV_UPLOAD;

  beforeEach(() => {
    process.env.ENABLE_CV_UPLOAD = "false";
  });

  it("rejects upload when feature is disabled", async () => {
    const file = new File(["test"], "cv.pdf", { type: "application/pdf" });

    await expect(uploadCvFile(file, VACANCY_ID)).rejects.toThrow("no está habilitada");
  });

  it("rejects non-pdf files", async () => {
    process.env.ENABLE_CV_UPLOAD = "true";
    const file = new File(["test"], "cv.txt", { type: "text/plain" });

    await expect(uploadCvFile(file, VACANCY_ID)).rejects.toThrow("PDF");
  });

  afterAll(() => {
    process.env.ENABLE_CV_UPLOAD = originalEnableCvUpload;
  });
});
