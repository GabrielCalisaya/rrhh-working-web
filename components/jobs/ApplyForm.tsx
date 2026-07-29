"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { applicationSchema } from "@/lib/validators/application";

type ApplyFormProps = {
  vacancyId: string;
};

export function ApplyForm({ vacancyId }: ApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

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
      cvFilePath: String(formData.get("cvFilePath") ?? "") || undefined,
    };

    const result = applicationSchema.safeParse(payload);
    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? "Datos inválidos");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });

    const data = (await response.json()) as { error?: string; message?: string };

    setMessage(data.message ?? data.error ?? "Postulación enviada");
    setIsSubmitting(false);
  }

  return (
    <form
      action={handleSubmit}
      className="grid gap-4 rounded-lg border border-[var(--color-accent)] bg-white p-6 shadow-sm"
      aria-label="Formulario de postulación"
    >
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            Nombre completo
          </label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">
            Ciudad
          </label>
          <Input id="city" name="city" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Teléfono
          </label>
          <Input id="phone" name="phone" />
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="mb-1 block text-sm font-medium">
          Skills (separadas por coma)
        </label>
        <Input id="skills" name="skills" required />
      </div>

      <div>
        <label htmlFor="coverLetter" className="mb-1 block text-sm font-medium">
          Carta de presentación
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          className="min-h-24 w-full rounded-md border border-[var(--color-accent)] bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="cvFilePath" className="mb-1 block text-sm font-medium">
          Ruta CV en Storage (opcional)
        </label>
        <Input id="cvFilePath" name="cvFilePath" placeholder="cvs/archivo.pdf" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="consent" type="checkbox" required />
        Acepto el tratamiento de mis datos para procesos de selección.
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar postulación"}
      </Button>

      {message ? <p className="text-sm text-[var(--color-primary-dark)]">{message}</p> : null}
    </form>
  );
}
