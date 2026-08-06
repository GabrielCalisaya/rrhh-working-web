"use client";

import { useState } from "react";
import { applicationStatusLabel } from "@/lib/content/status-labels";
import type { ApplicationStatus } from "@/lib/types";

export type AdminApplicationItem = {
  id: string;
  status: ApplicationStatus;
  vacancyTitle: string;
  candidateName: string;
  candidateEmail: string;
  hasCv: boolean;
};

type ApplicationsManagerProps = {
  initialApplications: AdminApplicationItem[];
};

export function ApplicationsManager({ initialApplications }: ApplicationsManagerProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [message, setMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  /**
   * La URL firmada dura 60 segundos y se pide recién al hacer click, para que
   * no quede enlazada en el HTML de la página ni en el historial del navegador.
   */
  async function downloadCv(applicationId: string) {
    setMessage(null);
    setDownloadingId(applicationId);

    try {
      const response = await fetch(`/api/applications/cv?applicationId=${encodeURIComponent(applicationId)}`);
      const result = (await response.json()) as { data?: { url: string }; error?: string };

      if (!response.ok || !result.data?.url) {
        setMessage(result.error ?? "No se pudo obtener el CV");
        return;
      }

      window.open(result.data.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    setMessage(null);
    const response = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const result = (await response.json()) as { data?: { id: string; status: ApplicationStatus }; error?: string };

    if (!response.ok || !result.data) {
      setMessage(result.error ?? "No se pudo actualizar");
      return;
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status: result.data?.status ?? application.status } : application,
      ),
    );
    setMessage("Estado actualizado");
  }

  return (
    <section className="space-y-4">
      {message ? <p className="text-sm text-[var(--color-primary-dark)]">{message}</p> : null}
      <div className="grid gap-3">
        {applications.map((application) => (
          <article key={application.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
            <p className="font-semibold">{application.vacancyTitle}</p>
            <p>{application.candidateName}</p>
            <p className="text-[var(--color-primary-dark)]">{application.candidateEmail}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[var(--color-primary-dark)]">Estado:</span>
              <select
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm"
                value={application.status}
                onChange={(event) => updateStatus(application.id, event.target.value as ApplicationStatus)}
              >
                {/* El value es el que guarda Postgres; el texto, el que lee el
                    equipo. Ver lib/content/status-labels.ts */}
                <option value="new">{applicationStatusLabel("new")}</option>
                <option value="review">{applicationStatusLabel("review")}</option>
                <option value="shortlist">{applicationStatusLabel("shortlist")}</option>
                <option value="rejected">{applicationStatusLabel("rejected")}</option>
                <option value="hired">{applicationStatusLabel("hired")}</option>
              </select>

              {application.hasCv ? (
                <button
                  type="button"
                  onClick={() => downloadCv(application.id)}
                  disabled={downloadingId === application.id}
                  className="rounded-md border border-[var(--color-primary)] px-2 py-1 text-xs font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
                >
                  {downloadingId === application.id ? "Generando..." : "Ver CV"}
                </button>
              ) : (
                <span className="text-xs text-[var(--color-primary-dark)]">Sin CV</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
