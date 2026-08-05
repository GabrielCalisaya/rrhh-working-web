"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { applicationSchema } from "@/lib/validators/application";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

type ApplyFormProps = {
  vacancyId: string;
  vacancyTitle: string;
};

type FormStatus = "idle" | "success" | "error";

export function ApplyForm({ vacancyId, vacancyTitle }: ApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // useCallback: sin esto la referencia cambia en cada render y el widget se
  // vuelve a montar en loop por la dependencia del useEffect.
  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function uploadCv(file: File) {
    const uploadPayload = new FormData();
    uploadPayload.append("file", file);
    uploadPayload.append("vacancyId", vacancyId);
    if (captchaToken) {
      uploadPayload.append("captchaToken", captchaToken);
    }

    const uploadResponse = await fetch("/api/applications/upload-cv", {
      method: "POST",
      body: uploadPayload,
    });

    const uploadResult = (await uploadResponse.json()) as { data?: { path: string }; error?: string };
    if (!uploadResponse.ok || !uploadResult.data?.path) {
      throw new Error(uploadResult.error ?? "No se pudo subir el CV");
    }

    return uploadResult.data.path;
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    let cvFilePath: string | undefined;

    const uploadedFile = formData.get("cvFile");
    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      try {
        cvFilePath = await uploadCv(uploadedFile);
      } catch (error) {
        setStatus("error");
        setMessage((error as Error).message);
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      vacancyId,
      candidate: {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        city: String(formData.get("city") ?? ""),
        linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
        portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
        skills: String(formData.get("skills") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        consent: formData.get("consent") === "on",
      },
      coverLetter: String(formData.get("coverLetter") ?? ""),
      cvFilePath,
    };

    const result = applicationSchema.safeParse(payload);
    if (!result.success) {
      setStatus("error");
      setMessage(result.error.issues[0]?.message ?? "Datos inválidos");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // El token va fuera del schema: Zod lo descartaría al parsear en el server.
      body: JSON.stringify({ ...result.data, captchaToken }),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "No se pudo enviar la postulación");
      setIsSubmitting(false);
      return;
    }

    setStatus("success");
    setMessage(data.message ?? "Postulación enviada correctamente");
    setIsSubmitting(false);
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-emerald-900">¡Postulación enviada!</p>
        <p className="mt-2 text-sm text-emerald-800">
          Recibimos tu postulación para <strong>{vacancyTitle}</strong>. Te contactaremos si avanzás en el proceso.
        </p>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="grid gap-5 rounded-xl border border-[var(--color-accent)] bg-white p-6 shadow-sm"
      aria-label="Formulario de postulación"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            Nombre completo *
          </label>
          <Input id="fullName" name="fullName" required placeholder="Ej. Ana Pérez" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email *
          </label>
          <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">
            Ciudad
          </label>
          <Input id="city" name="city" placeholder="Ej. Córdoba" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Teléfono
          </label>
          <Input id="phone" name="phone" placeholder="Ej. 351 555 1234" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="linkedinUrl" className="mb-1 block text-sm font-medium">
            LinkedIn
          </label>
          <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <label htmlFor="portfolioUrl" className="mb-1 block text-sm font-medium">
            Portfolio
          </label>
          <Input id="portfolioUrl" name="portfolioUrl" type="url" placeholder="https://..." />
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="mb-1 block text-sm font-medium">
          Skills (separadas por coma) *
        </label>
        <Input id="skills" name="skills" required placeholder="React, TypeScript, Testing" />
        <p className="mt-1 text-xs text-[var(--color-primary-dark)]">Usá las mismas palabras que aparecen en los requisitos de la vacante.</p>
      </div>

      <div>
        <label htmlFor="coverLetter" className="mb-1 block text-sm font-medium">
          Carta de presentación
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          className="min-h-32 w-full rounded-[var(--rw-radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-base text-[var(--color-text)] outline-none transition-[border-color,box-shadow] duration-[var(--rw-duration-fast)] focus:border-[var(--color-primary-dark)] focus:ring-4 focus:ring-[var(--color-primary)]/20 md:text-sm"
          placeholder="Contanos brevemente por qué te interesa este rol..."
        />
      </div>

      <div>
        <label htmlFor="cvFile" className="mb-1 block text-sm font-medium">
          CV en PDF (opcional)
        </label>
        <Input id="cvFile" name="cvFile" type="file" accept="application/pdf,.pdf" />
        <p className="mt-1 text-xs text-[var(--color-primary-dark)]">Máximo 5 MB. Solo archivos PDF.</p>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-[var(--color-accent)] bg-[var(--color-background)] p-3 text-sm">
        <input name="consent" type="checkbox" required className="mt-1" />
        <span>
          Acepto el tratamiento de mis datos personales para procesos de selección de RRHH Working. Conservamos tus
          datos 12 meses desde tu última postulación y podés pedir su eliminación cuando quieras. Ver{" "}
          <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline">
            política de privacidad
          </a>
          .
        </span>
      </label>

      <TurnstileWidget onToken={handleCaptchaToken} />

      {status === "error" && message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Enviando postulación..." : "Enviar postulación"}
      </Button>
    </form>
  );
}
