import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { uploadCvFile } from "@/lib/services/applications";

describe("uploadCvFile", () => {
  const originalEnableCvUpload = process.env.ENABLE_CV_UPLOAD;

  beforeEach(() => {
    process.env.ENABLE_CV_UPLOAD = "false";
  });

  it("rejects upload when feature is disabled", async () => {
    const file = new File(["test"], "cv.pdf", { type: "application/pdf" });

    await expect(uploadCvFile(file)).rejects.toThrow("no está habilitada");
  });

  it("rejects non-pdf files", async () => {
    process.env.ENABLE_CV_UPLOAD = "true";
    const file = new File(["test"], "cv.txt", { type: "text/plain" });

    await expect(uploadCvFile(file)).rejects.toThrow("PDF");
  });

  afterAll(() => {
    process.env.ENABLE_CV_UPLOAD = originalEnableCvUpload;
  });
});
