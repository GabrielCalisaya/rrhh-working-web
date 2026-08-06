import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/jobs/ApplyForm";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { BRAND } from "@/lib/content/institucional";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { employmentTypeLabel, seniorityLabel } from "@/lib/content/vacancy-labels";
import { formatDate } from "@/lib/utils/format";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELECT_FIELDS =
  "id, title, city, description, modality, seniority, employment_type, requirements, nice_to_have, created_at";

type VacancyDetail = {
  id: string;
  title: string;
  city: string;
  description: string;
  modality: string;
  seniority: string;
  employment_type: string;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  created_at: string;
};

/**
 * `cache()` de React deduplica la consulta dentro del mismo request.
 *
 * Sin esto habría dos lecturas a Supabase por visita: una en generateMetadata y
 * otra en el componente. Con cache, la segunda reusa el resultado de la primera.
 *
 * El chequeo de UUID va antes de consultar porque Postgres responde con error
 * de sintaxis (22P02) si el id no tiene formato válido. Funcionaba igual —caía
 * en notFound()— pero ensuciaba los logs con un error por cada bot que prueba
 * URLs inventadas.
 */
const getVacancy = cache(async (vacancyId: string): Promise<VacancyDetail | null> => {
  if (!UUID_PATTERN.test(vacancyId)) return null;

  // Página pública: no corre con la llave maestra. RLS ("vacancies open read
  // public") limita la lectura a status = 'open'.
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("vacancies")
    .select(SELECT_FIELDS)
    .eq("id", vacancyId)
    .eq("status", "open")
    .single();

  return (data as VacancyDetail | null) ?? null;
});

/**
 * Metadata por vacante.
 *
 * Antes esta página no definía ninguna, así que toda búsqueda compartida por
 * WhatsApp o redes mostraba el título genérico del sitio. Para una consultora
 * que difunde sus búsquedas en redes es pérdida directa de postulaciones: el
 * enlace no dice a qué puesto lleva.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ vacancyId: string }>;
}): Promise<Metadata> {
  const { vacancyId } = await params;
  const vacancy = await getVacancy(vacancyId);

  if (!vacancy) {
    return { title: "Búsqueda no disponible", robots: { index: false, follow: true } };
  }

  const title = `${vacancy.title} — ${vacancy.city}`;
  const description =
    `${vacancy.title} en ${vacancy.city}. ${vacancy.modality} · ${employmentTypeLabel(vacancy.employment_type)}. ` +
    `Postulate en línea en ${BRAND.name}.`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title: `${title} | ${BRAND.name}`,
      description,
      publishedTime: vacancy.created_at,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Vocabulario de schema.org, distinto del nuestro. */
const SCHEMA_EMPLOYMENT_TYPE: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contrato: "CONTRACTOR",
  Pasantía: "INTERN",
};

/**
 * Datos estructurados JobPosting.
 *
 * Es lo que habilita que la búsqueda aparezca en Google Jobs, que para un
 * portal de empleo suele ser la principal fuente de tráfico calificado.
 * Invisible para el usuario, sin costo de rendimiento y sin riesgo visual.
 */
function buildJobPostingSchema(vacancy: VacancyDetail) {
  const isRemote = vacancy.modality === "Remoto";

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description: vacancy.description,
    datePosted: vacancy.created_at,
    employmentType: SCHEMA_EMPLOYMENT_TYPE[vacancy.employment_type] ?? "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: BRAND.name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: vacancy.city,
        addressCountry: "AR",
      },
    },
    ...(isRemote ? { jobLocationType: "TELECOMMUTE" } : {}),
    ...(vacancy.requirements?.length ? { qualifications: vacancy.requirements.join(". ") } : {}),
    directApply: true,
  };
}

export default async function PostularPage({ params }: { params: Promise<{ vacancyId: string }> }) {
  const { vacancyId } = await params;
  const vacancy = await getVacancy(vacancyId);

  if (!vacancy) {
    notFound();
  }

  const requirements = vacancy.requirements ?? [];
  const niceToHave = vacancy.nice_to_have ?? [];

  return (
    <article className="space-y-8">
      {/* JSON-LD. La CSP permite scripts inline del propio documento. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJobPostingSchema(vacancy)) }}
      />

      <Link
        href="/empleos"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-primary-dark)] transition-colors hover:text-[var(--color-primary-strong)]"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Volver a empleos
      </Link>

      {/* --- Cabecera de la vacante --- */}
      <header className="u-animate-in overflow-hidden rounded-[var(--rw-radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--rw-shadow-md)]">
        {/* Filo superior de color: da profundidad a la tarjeta sin recurrir a
            una sombra más pesada, que sobre un fondo claro se ve sucia. */}
        <div aria-hidden="true" className="h-1 bg-[var(--color-primary)]" />

        <div className="p-6 md:p-8">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
            Búsqueda abierta
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-text)] md:text-4xl">
            {vacancy.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-primary-dark)]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="pin" className="h-4 w-4 text-[var(--color-primary)]" />
              {vacancy.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" className="h-4 w-4 text-[var(--color-primary)]" />
              Publicada el {formatDate(vacancy.created_at)}
            </span>
          </div>

          {/* Etiquetas universales en vez de los valores crudos de la base:
              "Avanzado" y "Jornada completa" en lugar de "Senior" y
              "Full-time". El valor almacenado no cambia. */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{vacancy.modality}</Badge>
            <Badge>{employmentTypeLabel(vacancy.employment_type, "long")}</Badge>
            <Badge>{seniorityLabel(vacancy.seniority, "long")}</Badge>
          </div>

          {/* En mobile la descripción y los requisitos empujan el formulario muy
              abajo. Este ancla evita tener que scrollear a ciegas buscándolo. */}
          <a
            href="#postular"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--rw-radius-md)] bg-[var(--color-btn-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--color-btn-primary-fg)] shadow-[var(--rw-shadow-xs)] transition-[background-color,box-shadow] duration-[var(--rw-duration-fast)] hover:bg-[var(--color-btn-primary-bg-hover)] hover:shadow-[var(--rw-shadow-sm)] md:hidden"
          >
            Ir al formulario
          </a>
        </div>
      </header>

      {/* --- Descripción --- */}
      <section className="rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--rw-shadow-sm)] md:p-8">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Sobre la búsqueda</h2>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text)]">
          {vacancy.description}
        </p>
      </section>

      {/* --- Requisitos y deseables ---
          Estos datos ya estaban en la base pero la página nunca los traía: el
          candidato postulaba sin saber qué se pedía, y el formulario le decía
          "usá las mismas palabras que aparecen en los requisitos" refiriéndose
          a una lista que no se mostraba en ninguna parte. */}
      {requirements.length > 0 || niceToHave.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {requirements.length > 0 ? (
            <div className="rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--rw-shadow-sm)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Requisitos</h2>
              <ul className="mt-4 space-y-2.5">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <Icon
                      name="check"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-dark)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {niceToHave.length > 0 ? (
            <div className="rounded-[var(--rw-radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Se valora</h2>
              <p className="mt-1 text-xs text-[var(--color-primary-dark)]">
                No es excluyente: podés postularte igual.
              </p>
              <ul className="mt-4 space-y-2.5">
                {niceToHave.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* --- Formulario --- */}
      <section id="postular" className="scroll-mt-28">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">
          Completá tu postulación
        </h2>
        <ApplyForm
          vacancyId={vacancy.id}
          vacancyTitle={vacancy.title}
          requirements={requirements}
          niceToHave={niceToHave}
        />
      </section>
    </article>
  );
}
