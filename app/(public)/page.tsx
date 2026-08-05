import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { BRAND, SERVICES, VALUES } from "@/lib/content/institucional";

export default function HomePage() {
  return (
    <section className="grid gap-12">
      {/* Hero */}
      <div className="rounded-xl bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">
          Consultora de Recursos Humanos · {BRAND.location}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Soluciones innovadoras para la gestión de talentos.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-primary-dark)]">
          Brindamos soluciones estratégicas e integrales en Recursos Humanos que impulsan el crecimiento de empresas y
          profesionales: reclutamiento y selección de personal, consultoría, capacitación y desarrollo del talento.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/contacto">
            <Button>Iniciar una búsqueda</Button>
          </Link>
          <Link href="/empleos">
            <Button variant="secondary">Ver empleos disponibles</Button>
          </Link>
        </div>
      </div>

      {/* Servicios destacados */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Qué hacemos</h2>
            <p className="mt-1 text-sm text-[var(--color-primary-dark)]">
              Acompañamos a empresas en sus búsquedas y a profesionales en su desarrollo.
            </p>
          </div>
          <Link href="/servicios" className="text-sm font-semibold text-[var(--color-primary-dark)] hover:underline">
            Ver todos los servicios
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SERVICES.slice(0, 3).map((service) => (
            <Card key={service.title}>
              <span className="text-[var(--color-primary)]">
                <Icon name={service.icon} />
              </span>
              <h3 className="mt-3 text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Enfoque y valores */}
      <div className="rounded-xl border border-[var(--color-accent)] bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Nuestro enfoque</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--color-primary-dark)]">
          Trabajamos con un enfoque personalizado, utilizando metodologías actualizadas y herramientas innovadoras para
          conectar el talento adecuado con las oportunidades correctas.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <li key={value.title} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                <Icon name={value.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{value.title}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <Link href="/nosotros">
            <Button variant="secondary">Conocer al equipo</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
