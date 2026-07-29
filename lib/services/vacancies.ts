import type { Vacancy, VacancyFilters } from "@/lib/types";
import { toSlug } from "@/lib/utils/format";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { VacancyInput, VacancyUpdateInput } from "@/lib/validators/vacancy";

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

export function filterVacancies(vacancies: Vacancy[], filters: VacancyFilters): Vacancy[] {
  return vacancies.filter((vacancy) => {
    if (filters.city && vacancy.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.modality && vacancy.modality !== filters.modality) {
      return false;
    }

    if (filters.seniority && vacancy.seniority !== filters.seniority) {
      return false;
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchable = `${vacancy.title} ${vacancy.description} ${vacancy.requirements.join(" ")}`.toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }

    return true;
  });
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
