import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { BRAND, PROCESS_STEPS, SERVICES } from "@/lib/content/institucional";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Reclutamiento y selección de personal, difusión de ofertas laborales, armado de CV, carta de presentación y optimización de perfiles en LinkedIn y CompuTrabajo.",
  openGraph: {
    title: `Servicios | ${BRAND.name}`,
    description:
      "Soluciones de Recursos Humanos para empresas y profesionales: selección de personal, difusión de ofertas y optimización de perfiles laborales.",
  },
};

const STAGES = ["Búsqueda", "Selección"] as const;

const STAGE_INTRO: Record<(typeof STAGES)[number], string> = {
  Búsqueda: "Definimos qué se necesita y salimos a buscarlo.",
  Selección: "Evaluamos, verificamos y presentamos.",
};

export default function ServiciosPage() {
  return (
    <div className="space-y-14">
      {/* Servicios */}
      <section className="u-reveal space-y-6">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">Servicios</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--color-primary-dark)]">
            Soluciones estratégicas e integrales en Recursos Humanos para empresas que necesitan incorporar talento y
            para profesionales que buscan potenciar su perfil.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <li key={service.title}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[var(--color-primary)]">
                    <Icon name={service.icon} />
                  </span>
                  <Badge>{service.audience}</Badge>
                </div>
                <h2 className="mt-3 text-lg font-semibold">{service.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">{service.description}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Proceso de selección */}
      <section className="u-reveal space-y-6">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">Proceso de búsqueda y selección</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--color-primary-dark)]">
            Un servicio de selección caracterizado por su seguridad y meticulosidad. Así trabajamos cada búsqueda, desde
            la primera reunión hasta el informe final.
          </p>
        </div>

        {STAGES.map((stage) => {
          const steps = PROCESS_STEPS.filter((step) => step.stage === stage);
          // Numeración continua entre las dos etapas.
          const offset = PROCESS_STEPS.findIndex((step) => step.stage === stage);

          return (
            <div key={stage} className="space-y-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-lg font-semibold">{stage}</h3>
                <p className="text-sm text-[var(--color-primary-dark)]">{STAGE_INTRO[stage]}</p>
              </div>

              <ol className="relative space-y-4 border-l-2 border-[var(--color-border)] pl-6 md:pl-8">
                {steps.map((step, index) => (
                  <li key={step.title} className="relative">
                    {/* Marcador del timeline, centrado sobre la línea */}
                    <span
                      className="absolute -left-[2.15rem] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-btn-primary-bg)] text-xs font-semibold text-[var(--color-btn-primary-fg)] md:-left-[2.65rem]"
                      aria-hidden="true"
                    >
                      {offset + index + 1}
                    </span>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                      <h4 className="font-semibold">
                        <span className="sr-only">Paso {offset + index + 1}: </span>
                        {step.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-primary-dark)]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <section className="u-reveal rounded-[var(--rw-radius-xl)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent-soft)]/60 to-[var(--color-surface)] p-8 text-center shadow-[var(--rw-shadow-sm)] md:p-10">
        <h2 className="text-xl font-semibold">¿Necesitás cubrir una posición?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-primary-dark)]">
          Escribinos y coordinamos una reunión para relevar el perfil que estás buscando.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/contacto">
            <Button>Contactanos</Button>
          </Link>
          <Link href="/nosotros">
            <Button variant="secondary">Conocer al equipo</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
