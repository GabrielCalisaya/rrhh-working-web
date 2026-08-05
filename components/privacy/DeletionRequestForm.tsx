"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

export function DeletionRequestForm() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/privacy/deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reason, captchaToken }),
    });

    const data = (await response.json()) as { error?: string; message?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.error ?? "No se pudo enviar la solicitud");
      return;
    }

    setDone(true);
    setMessage(data.message ?? "Solicitud recibida");
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6" role="status">
        <p className="font-semibold text-emerald-900">Solicitud recibida</p>
        <p className="mt-2 text-sm text-emerald-800">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-[var(--color-accent)] bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="deletion-email" className="mb-1 block text-sm font-medium">
          Email con el que te postulaste *
        </label>
        <Input
          id="deletion-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="deletion-reason" className="mb-1 block text-sm font-medium">
          Motivo (opcional)
        </label>
        <textarea
          id="deletion-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={500}
          className="min-h-24 w-full rounded-md border border-[var(--color-accent)] bg-white px-3 py-2 text-sm"
        />
      </div>

      <TurnstileWidget onToken={handleCaptchaToken} />

      {message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Enviando..." : "Solicitar eliminación"}
      </Button>
    </form>
  );
}
