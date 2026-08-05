import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ABOUT_PARAGRAPHS, BRAND, MISSION, TEAM, VALUES, VISION } from "@/lib/content/institucional";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Consultora de Recursos Humanos en San Salvador de Jujuy. Conocé nuestro equipo de licenciadas en RRHH, nuestra misión, visión y valores.",
  openGraph: {
    title: `Quiénes somos | ${BRAND.name}`,
    description:
      "Consultora de Recursos Humanos en San Salvador de Jujuy, especializada en soluciones estratégicas para empresas y desarrollo profesional.",
  },
};

/** Iniciales para el avatar. El portafolio no incluye fotos del equipo. */
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function NosotrosPage() {
  return (
    <div className="space-y-14">
      {/* Quiénes somos */}
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">{BRAND.location}</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Quiénes somos</h1>
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-[var(--color-primary-dark)]">
          {ABOUT_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Visión y misión */}
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Visión y misión</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-l-4 border-l-[var(--color-primary)]">
            <span className="text-[var(--color-primary)]">
              <Icon name="spark" />
            </span>
            <h3 className="mt-3 text-lg font-semibold">Visión empresarial</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">{VISION}</p>
          </Card>

          <Card className="border-l-4 border-l-[var(--color-primary-dark)]">
            <span className="text-[var(--color-primary)]">
              <Icon name="search" />
            </span>
            <h3 className="mt-3 text-lg font-semibold">Misión empresarial</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">{MISSION}</p>
          </Card>
        </div>
      </section>

      {/* Valores */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Valores empresariales</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-primary-dark)]">
            Los principios que sostienen cada proceso, tanto con empresas como con candidatos.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <li key={value.title}>
              <Card className="h-full">
                <span className="text-[var(--color-primary)]">
                  <Icon name={value.icon} />
                </span>
                <h3 className="mt-3 text-base font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">{value.description}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Equipo */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Nuestro equipo</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-primary-dark)]">
            Licenciadas en Recursos Humanos con experiencia en reclutamiento, selección, gestión del talento y
            capacitación.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {TEAM.map((member) => (
            <li key={member.name}>
              <Card className="h-full">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-lg font-semibold text-[var(--color-primary-dark)]"
                  aria-hidden="true"
                >
                  {initials(member.name)}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                <p className="text-sm font-medium text-[var(--color-primary)]">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-primary-dark)]">{member.bio}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Clientes */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">Nuestros clientes</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-primary-dark)]">
            Empresas que confiaron en nosotras para sus procesos de búsqueda y selección.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/*
            Espacio reservado para los logos. El portafolio incluye la sección
            "Nuestros Clientes" pero sin nombres legibles, así que no se listan
            empresas: cargar los logos reales reemplazando estos marcadores.
          */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[var(--color-accent)] bg-white text-xs text-[var(--color-primary-dark)]"
            >
              Logo cliente
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-[var(--color-accent)] bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold">¿Buscás incorporar talento a tu equipo?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-primary-dark)]">
          Contanos qué perfil necesitás y armamos el proceso de búsqueda a medida.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/contacto">
            <Button>Contactanos</Button>
          </Link>
          <Link href="/servicios">
            <Button variant="secondary">Ver el proceso de selección</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
