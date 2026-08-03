import type { Vacancy } from "@/lib/types";
import { toSlug } from "@/lib/utils/format";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { VacancyInput, VacancyUpdateInput } from "@/lib/validators/vacancy";
export { filterVacancies } from "@/lib/utils/vacancies";

export function mapVacancyRow(row: Record<string, unknown>): Vacancy {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    city: String(row.city),
    modality: row.modality as Vacancy["modality"],
    employment_type: row.employment_type as Vacancy["employment_type"],
    seniority: row.seniority as Vacancy["seniority"],
    description: String(row.description),
    requirements: Array.isArray(row.requirements) ? row.requirements.map(String) : [],
    nice_to_have: Array.isArray(row.nice_to_have) ? row.nice_to_have.map(String) : [],
    status: row.status as Vacancy["status"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listOpenVacancies() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("vacancies")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => mapVacancyRow(item));
}

export async function createVacancy(input: VacancyInput, createdBy: string) {
  const supabase = getSupabaseServiceRoleClient();
  const payload = {
    ...input,
    slug: toSlug(input.title),
    created_by: createdBy,
  };

  const { data, error } = await supabase.from("vacancies").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return mapVacancyRow(data);
}

export async function updateVacancy(input: VacancyUpdateInput) {
  const { id, ...payload } = input;
  const supabase = getSupabaseServiceRoleClient();

  const updatePayload = {
    ...payload,
    ...(payload.title ? { slug: toSlug(payload.title) } : {}),
  };

  const { data, error } = await supabase.from("vacancies").update(updatePayload).eq("id", id).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return mapVacancyRow(data);
}
