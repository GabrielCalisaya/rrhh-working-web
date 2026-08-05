import type { Vacancy, VacancyFilters } from "@/lib/types";
import { toSlug } from "@/lib/utils/format";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { VacancyInput, VacancyUpdateInput } from "@/lib/validators/vacancy";

// Todas estas operaciones pasan ahora por el cliente con la anon key y la sesión
// del usuario, así que RLS decide qué se puede leer y escribir. Antes usaban
// service_role, que bypassea RLS: las políticas de rls.sql eran decorativas.
//
// Políticas que las habilitan (supabase/rls.sql):
//   listOpenVacancies -> "vacancies open read public" (anon incluido)
//   create/update     -> "vacancies staff manage"

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
  return listOpenVacanciesFiltered({});
}

/**
 * Listado público filtrado en Postgres.
 *
 * Antes se traía el catálogo completo (descripciones y arrays incluidos), se
 * serializaba al bundle y se filtraba en memoria del navegador: el payload
 * crecía con cada vacante y los índices idx_vacancies_city / idx_vacancies_status
 * nunca se usaban.
 */
export async function listOpenVacanciesFiltered(filters: VacancyFilters) {
  const supabase = await getSupabaseServerClient();

  let query = supabase.from("vacancies").select("*").eq("status", "open");

  if (filters.city) {
    query = query.ilike("city", filters.city);
  }
  if (filters.modality) {
    query = query.eq("modality", filters.modality);
  }
  if (filters.seniority) {
    query = query.eq("seniority", filters.seniority);
  }
  if (filters.query) {
    // Escapado de los comodines de LIKE: sin esto, un "%" del usuario haría
    // que la búsqueda devuelva todo.
    const term = filters.query.replace(/[\\%_]/g, (char) => `\\${char}`);
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(200);

  if (error) {
    throw new Error(`vacancies.select falló: ${error.message}`);
  }

  return (data ?? []).map((item) => mapVacancyRow(item));
}

/** Valores disponibles para poblar los selects del filtro. */
export async function listVacancyFacets() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("vacancies")
    .select("city, modality, seniority")
    .eq("status", "open")
    .limit(500);

  if (error) {
    throw new Error(`vacancies.facets falló: ${error.message}`);
  }

  const rows = (data ?? []) as { city: string; modality: string; seniority: string }[];

  return {
    cities: [...new Set(rows.map((row) => row.city))].sort(),
    modalities: [...new Set(rows.map((row) => row.modality))].sort(),
    seniorities: [...new Set(rows.map((row) => row.seniority))].sort(),
  };
}

export async function createVacancy(input: VacancyInput, createdBy: string) {
  const supabase = await getSupabaseServerClient();
  const payload = {
    ...input,
    slug: toSlug(input.title),
    created_by: createdBy,
  };

  const { data, error } = await supabase.from("vacancies").insert(payload).select("*").single();

  if (error) {
    throw new Error(`vacancies.insert falló: ${error.message}`);
  }

  return mapVacancyRow(data);
}

export async function updateVacancy(input: VacancyUpdateInput) {
  const { id, ...payload } = input;
  const supabase = await getSupabaseServerClient();

  const updatePayload = {
    ...payload,
    ...(payload.title ? { slug: toSlug(payload.title) } : {}),
  };

  const { data, error } = await supabase.from("vacancies").update(updatePayload).eq("id", id).select("*").single();

  if (error) {
    throw new Error(`vacancies.update falló: ${error.message}`);
  }

  return mapVacancyRow(data);
}
