"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/lib/types";

export type AdminApplicationItem = {
  id: string;
  status: ApplicationStatus;
  vacancyTitle: string;
  candidateName: string;
  candidateEmail: string;
};

type ApplicationsManagerProps = {
  initialApplications: AdminApplicationItem[];
};

export function ApplicationsManager({ initialApplications }: ApplicationsManagerProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [message, setMessage] = useState<string | null>(null);

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
          <article key={application.id} className="rounded-lg border border-[var(--color-accent)] bg-white p-4 text-sm">
            <p className="font-semibold">{application.vacancyTitle}</p>
            <p>{application.candidateName}</p>
            <p className="text-[var(--color-primary-dark)]">{application.candidateEmail}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[var(--color-primary-dark)]">Estado:</span>
              <select
                className="rounded-md border border-[var(--color-accent)] bg-white px-2 py-1 text-sm"
                value={application.status}
                onChange={(event) => updateStatus(application.id, event.target.value as ApplicationStatus)}
              >
                <option value="new">new</option>
                <option value="review">review</option>
                <option value="shortlist">shortlist</option>
                <option value="rejected">rejected</option>
                <option value="hired">hired</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
