"use client";

import { useState } from "react";
import type { DeletionRequestRow } from "@/lib/services/privacy";

const STATUS_LABEL: Record<DeletionRequestRow["status"], string> = {
  pending: "Pendiente",
  completed: "Ejecutada",
  rejected: "Rechazada",
};

export function DeletionRequestsManager({ initialRequests }: { initialRequests: DeletionRequestRow[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function resolve(id: string, action: "complete" | "reject", email: string) {
    if (
      action === "complete" &&
      !window.confirm(
        `Vas a eliminar de forma PERMANENTE todos los datos de ${email}: ficha de candidato, todas sus postulaciones y sus CV.\n\nEsta acción no se puede deshacer. ¿Confirmás?`,
      )
    ) {
      return;
    }

    setBusyId(id);
    setMessage(null);

    const response = await fetch("/api/privacy/deletion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });

    const result = (await response.json()) as {
      data?: { status: string; candidateFound?: boolean; deletedCvCount?: number };
      error?: string;
    };

    setBusyId(null);

    if (!response.ok || !result.data) {
      setMessage(result.error ?? "No se pudo resolver la solicitud");
      return;
    }

    setRequests((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: action === "complete" ? "completed" : "rejected" } : item,
      ),
    );

    setMessage(
      action === "complete"
        ? result.data.candidateFound
          ? `Datos eliminados (${result.data.deletedCvCount ?? 0} CV borrados).`
          : "Solicitud cerrada: no había datos para ese email."
        : "Solicitud rechazada.",
    );
  }

  if (requests.length === 0) {
    return <p className="text-sm text-[var(--color-primary-dark)]">No hay solicitudes de eliminación.</p>;
  }

  return (
    <section className="space-y-4">
      {message ? <p className="text-sm text-[var(--color-primary-dark)]">{message}</p> : null}

      <div className="grid gap-3">
        {requests.map((item) => (
          <article key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{item.email}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.status === "pending"
                    ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                    : item.status === "completed"
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
                      : "bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)]"
                }`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>

            <p className="mt-1 text-xs text-[var(--color-primary-dark)]">
              Solicitada el {new Date(item.requested_at).toLocaleDateString("es-AR")}
            </p>

            {item.reason ? <p className="mt-2 whitespace-pre-wrap">{item.reason}</p> : null}

            {item.status === "pending" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => resolve(item.id, "complete", item.email)}
                  disabled={busyId === item.id}
                  className="inline-flex min-h-9 items-center rounded-[var(--rw-radius-md)] bg-[var(--color-danger-solid-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger-solid-fg)] transition-colors duration-[var(--rw-duration-fast)] hover:bg-[var(--color-danger-solid-bg-hover)] disabled:opacity-60"
                >
                  {busyId === item.id ? "Eliminando..." : "Eliminar datos"}
                </button>
                <button
                  type="button"
                  onClick={() => resolve(item.id, "reject", item.email)}
                  disabled={busyId === item.id}
                  className="rounded-md border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
                >
                  Rechazar
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
