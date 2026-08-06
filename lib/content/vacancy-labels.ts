/**
 * Etiquetas visibles de las vacantes.
 *
 * PROBLEMA QUE RESUELVE
 * El vocabulario del sistema salió del mundo IT: "Junior / Semi Senior / Senior
 * / Lead" es un escalafón que en gastronomía, construcción, comercio o salud no
 * significa nada. Un cocinero con quince años de oficio no se identifica como
 * "Senior", y menos como "Lead". Lo mismo con "Full-time" y "Part-time", que
 * son anglicismos innecesarios en un aviso local.
 *
 * POR QUÉ SE HACE ACÁ Y NO EN LA BASE
 * `vacancies.seniority` y `vacancies.employment_type` tienen restricciones
 * CHECK en Postgres. Cambiar los valores exigiría una migración, invalidaría
 * las filas existentes y rompería el panel. No hace falta: lo que ve la persona
 * es una etiqueta, no el valor almacenado. Traducimos en la capa de
 * presentación y la base queda intacta.
 *
 * Dos versiones de cada etiqueta:
 * - `short`: para los badges de las tarjetas, donde el espacio manda.
 * - `long`:  para los desplegables y el detalle, donde conviene ser explícito.
 */

import type { Vacancy } from "@/lib/types";

type Label = { short: string; long: string };

/**
 * Nivel de experiencia. El rango de años es orientativo y va entre paréntesis
 * para que sirva de referencia sin sonar a requisito excluyente.
 */
export const SENIORITY_LABELS: Record<Vacancy["seniority"], Label> = {
  Junior: { short: "Inicial", long: "Sin experiencia previa o hasta 1 año" },
  "Semi Senior": { short: "Intermedio", long: "Experiencia intermedia (1 a 3 años)" },
  Senior: { short: "Avanzado", long: "Amplia experiencia (más de 3 años)" },
  Lead: { short: "Jefatura", long: "Jefatura, coordinación o supervisión" },
};

export const EMPLOYMENT_TYPE_LABELS: Record<Vacancy["employment_type"], Label> = {
  "Full-time": { short: "Jornada completa", long: "Jornada completa" },
  "Part-time": { short: "Media jornada", long: "Media jornada" },
  Contrato: { short: "Contrato temporal", long: "Contrato temporal o por obra" },
  Pasantía: { short: "Pasantía", long: "Pasantía" },
};

/**
 * Los helpers aceptan `string` y no el tipo estricto porque los valores llegan
 * de la base y de la query string. Si aparece uno desconocido —una fila vieja,
 * un parámetro manipulado— se muestra tal cual en lugar de romper la página.
 */
export function seniorityLabel(value: string, variant: keyof Label = "short"): string {
  return SENIORITY_LABELS[value as Vacancy["seniority"]]?.[variant] ?? value;
}

export function employmentTypeLabel(value: string, variant: keyof Label = "short"): string {
  return EMPLOYMENT_TYPE_LABELS[value as Vacancy["employment_type"]]?.[variant] ?? value;
}

/** Rótulo del campo, también fuera del vocabulario IT ("seniority"). */
export const SENIORITY_FIELD_LABEL = "Nivel de experiencia";
