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
      <section className="u-reveal space-y-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">{BRAND.location}</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Quiénes somos</h1>
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-[var(--color-primary-dark)]">
          {ABOUT_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Visión y misión */}
      <section className="u-reveal space-y-5">
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
      <section className="u-reveal space-y-5">
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
      <section className="u-reveal space-y-5">
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

      {/*
        SECCIÓN "NUESTROS CLIENTES" — retirada, no perdida.

        Tenía ocho recuadros punteados con el texto "Logo cliente". En una
        sección cuyo propósito es generar confianza, ese marcador comunica lo
        contrario: que el sitio quedó a medio terminar. Y estaba en producción,
        justo debajo de la presentación del equipo.

        Un espacio vacío no resta; un vacío señalado, sí. Por eso se retira
        completa en lugar de dejar los marcadores hasta que lleguen los logos.

        Para restituirla cuando estén disponibles:
          1. Guardar los archivos en /public/clientes/.
          2. Agregar `export const CLIENTS = [{ name, logo }, ...]` en
             lib/content/institucional.ts.
          3. Recuperar esta sección desde el historial de git y recorrer CLIENTS
             con <Image /> en vez del Array.from de marcadores.
      */}

      {/* CTA */}
      <section className="u-reveal rounded-[var(--rw-radius-xl)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent-soft)]/60 to-[var(--color-surface)] p-8 text-center shadow-[var(--rw-shadow-sm)] md:p-10">
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
