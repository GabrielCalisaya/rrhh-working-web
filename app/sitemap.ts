import type { MetadataRoute } from "next";
import { logError } from "@/lib/observability/log";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils/site-url";

/**
 * sitemap.xml
 *
 * Le da a Google la lista de páginas del sitio. Lo importante no son las
 * institucionales —esas las encuentra igual siguiendo enlaces— sino las
 * VACANTES: cada búsqueda abierta es una página nueva que aparece y desaparece,
 * y sin sitemap Google puede tardar días en descubrirla. Para un aviso que se
 * cierra en dos semanas, esos días son la mitad de su vida útil.
 *
 * Junto con el JSON-LD de JobPosting que ya tiene cada página de vacante, es lo
 * que habilita la aparición en Google Jobs.
 */

/** Se revalida cada hora: las vacantes cambian, pero no minuto a minuto. */
export const revalidate = 3600;

type VacancyRow = { id: string; updated_at: string | null; created_at: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/empleos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  /**
   * Si Supabase no responde, el sitemap sale igual con las páginas fijas.
   *
   * Un sitemap incompleto es un problema menor y temporal; uno que lanza una
   * excepción rompe el build entero o devuelve un 500 a Google, que es mucho
   * peor. Por eso el catch devuelve lo que se pueda y deja registro.
   */
  let vacancyRoutes: MetadataRoute.Sitemap = [];

  try {
    // RLS ("vacancies open read public") ya limita la lectura a status = 'open',
    // pero el filtro va explícito: el sitemap no debe exponer borradores.
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("vacancies")
      .select("id, updated_at, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw new Error(error.message);

    vacancyRoutes = ((data ?? []) as VacancyRow[]).map((vacancy) => ({
      url: `${base}/postular/${vacancy.id}`,
      lastModified: new Date(vacancy.updated_at ?? vacancy.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    logError("sitemap.vacancies", error);
  }

  return [...staticRoutes, ...vacancyRoutes];
}
