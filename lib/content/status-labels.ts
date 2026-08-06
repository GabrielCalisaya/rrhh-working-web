/**
 * Etiquetas en español de los estados del sistema.
 *
 * Los valores guardados ("new", "shortlist", "draft", "recruiter") vienen de
 * restricciones CHECK en Postgres y de la lógica de permisos: no se tocan. Lo
 * que cambia es lo que lee el equipo en pantalla.
 *
 * Hasta ahora los desplegables del panel mostraban el valor crudo en inglés. No
 * es sólo prolijidad: "shortlist" o "review" obligan a traducir mentalmente en
 * cada uso, y en un equipo donde no todos manejan inglés técnico, se presta a
 * marcar el estado equivocado en la ficha de un candidato.
 *
 * Mismo criterio que `vacancy-labels.ts`: traducir en la capa de presentación,
 * nunca en la base.
 */

import type { AppRole, ApplicationStatus, VacancyStatus } from "@/lib/types";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Nueva",
  review: "En revisión",
  shortlist: "Preseleccionado",
  rejected: "Descartado",
  hired: "Contratado",
};

export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  draft: "Borrador",
  open: "Abierta",
  closed: "Cerrada",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  recruiter: "Reclutador",
};

/**
 * Los helpers aceptan `string` porque los valores llegan de la base. Si
 * apareciera uno desconocido —una fila vieja, un estado agregado a mano— se
 * muestra tal cual en lugar de romper la pantalla.
 */
export function applicationStatusLabel(value: string): string {
  return APPLICATION_STATUS_LABELS[value as ApplicationStatus] ?? value;
}

export function vacancyStatusLabel(value: string): string {
  return VACANCY_STATUS_LABELS[value as VacancyStatus] ?? value;
}

export function roleLabel(value: string): string {
  return ROLE_LABELS[value as AppRole] ?? value;
}
