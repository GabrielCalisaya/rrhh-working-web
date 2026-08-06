"use client";

import { useMemo, useState } from "react";
import { employmentTypeLabel, seniorityLabel } from "@/lib/content/vacancy-labels";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Vacancy, VacancyStatus } from "@/lib/types";
import type { VacancyInput } from "@/lib/validators/vacancy";

const INITIAL_FORM: VacancyInput = {
  title: "",
  city: "",
  modality: "Híbrido",
  employment_type: "Full-time",
  seniority: "Semi Senior",
  description: "",
  requirements: [],
  nice_to_have: [],
  status: "draft",
};

type VacanciesManagerProps = {
  initialVacancies: Vacancy[];
};

export function VacanciesManager({ initialVacancies }: VacanciesManagerProps) {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [form, setForm] = useState(INITIAL_FORM);
  const [requirementsText, setRequirementsText] = useState("");
  const [niceToHaveText, setNiceToHaveText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const orderedVacancies = useMemo(
    () => [...vacancies].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [vacancies],
  );

  async function createVacancy() {
    setSaving(true);
    setMessage(null);
    const payload: VacancyInput = {
      ...form,
      requirements: requirementsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      nice_to_have: niceToHaveText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/vacancies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { data?: Vacancy; error?: string };

    if (!response.ok || !result.data) {
      setMessage(result.error ?? "No se pudo crear la vacante");
      setSaving(false);
      return;
    }

    setVacancies((current) => [result.data as Vacancy, ...current]);
    setForm(INITIAL_FORM);
    setRequirementsText("");
    setNiceToHaveText("");
    setMessage("Vacante creada");
    setSaving(false);
  }

  async function updateStatus(id: string, status: VacancyStatus) {
    const response = await fetch("/api/vacancies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const result = (await response.json()) as { data?: Vacancy; error?: string };

    if (!response.ok || !result.data) {
      setMessage(result.error ?? "No se pudo actualizar el estado");
      return;
    }

    setVacancies((current) =>
      current.map((vacancy) => (vacancy.id === id ? { ...vacancy, status: result.data?.status ?? vacancy.status } : vacancy)),
    );
    setMessage("Estado actualizado");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="text-lg font-semibold">Nueva vacante</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input placeholder="Título" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <Input placeholder="Ciudad" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          <select
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            value={form.modality}
            onChange={(event) => setForm((current) => ({ ...current, modality: event.target.value as Vacancy["modality"] }))}
          >
            <option value="Presencial">Presencial</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Remoto">Remoto</option>
          </select>
          <select
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            value={form.employment_type}
            onChange={(event) => setForm((current) => ({ ...current, employment_type: event.target.value as Vacancy["employment_type"] }))}
          >
            {/* El value es el que exige el CHECK de Postgres; el texto es el
                que ve el equipo. Ver lib/content/vacancy-labels.ts */}
            <option value="Full-time">{employmentTypeLabel("Full-time", "long")}</option>
            <option value="Part-time">{employmentTypeLabel("Part-time", "long")}</option>
            <option value="Contrato">{employmentTypeLabel("Contrato", "long")}</option>
            <option value="Pasantía">{employmentTypeLabel("Pasantía", "long")}</option>
          </select>
          <select
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            value={form.seniority}
            onChange={(event) => setForm((current) => ({ ...current, seniority: event.target.value as Vacancy["seniority"] }))}
          >
            <option value="Junior">{seniorityLabel("Junior", "long")}</option>
            <option value="Semi Senior">{seniorityLabel("Semi Senior", "long")}</option>
            <option value="Senior">{seniorityLabel("Senior", "long")}</option>
            <option value="Lead">{seniorityLabel("Lead", "long")}</option>
          </select>
          <select
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as VacancyStatus }))}
          >
            <option value="draft">draft</option>
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
        </div>
        <textarea
          className="mt-3 min-h-24 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          placeholder="Descripción (mínimo 20 caracteres)"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
        <Input className="mt-3" placeholder="Requisitos (coma separados)" value={requirementsText} onChange={(event) => setRequirementsText(event.target.value)} />
        <Input className="mt-3" placeholder="Deseables (coma separados)" value={niceToHaveText} onChange={(event) => setNiceToHaveText(event.target.value)} />
        <div className="mt-3 flex items-center gap-3">
          <Button type="button" onClick={createVacancy} disabled={saving}>
            {saving ? "Guardando..." : "Crear vacante"}
          </Button>
          {message ? <p className="text-sm text-[var(--color-primary-dark)]">{message}</p> : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Actualizar</th>
            </tr>
          </thead>
          <tbody>
            {orderedVacancies.map((vacancy) => (
              <tr key={vacancy.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3">{vacancy.title}</td>
                <td className="px-4 py-3">{vacancy.city}</td>
                <td className="px-4 py-3">{vacancy.status}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm"
                    value={vacancy.status}
                    onChange={(event) => updateStatus(vacancy.id, event.target.value as VacancyStatus)}
                  >
                    <option value="draft">draft</option>
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
