import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { BRAND, SERVICES, VALUES } from "@/lib/content/institucional";

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      {/* =====================================================================
          HERO
          ---------------------------------------------------------------------
          Era el elemento más plano del sitio y es lo primero que se ve: una
          tarjeta blanca sobre un fondo casi blanco, sin profundidad ni ancla
          visual. Ahora aporta jerarquía por tres vías, ninguna decorativa:

          - Profundidad: gradiente propio + filo de color + sombra de dos capas,
            para que el bloque se despegue del fondo en lugar de fundirse.
          - Textura: una trama de puntos muy tenue que se desvanece hacia abajo.
            Es la diferencia entre un fondo "vacío" y uno "tratado", y se hace
            con un radial-gradient: sin imágenes, sin peso.
          - Tipografía fluida: el título escala con el viewport en vez de saltar
            de golpe en el breakpoint. A 320px medía 36px y ahogaba la pantalla.

          Deliberadamente NO se agregó una banda de métricas ("+10 años",
          "+500 candidatos"). El archivo institucional deja constancia de que el
          portafolio no informa antigüedad ni volumen de clientes, así que
          cualquier número sería inventado. En una consultora, un dato de
          confianza falso es exactamente lo que destruye la confianza.
          ===================================================================== */}
      <section className="relative overflow-hidden rounded-[var(--rw-radius-xl)] border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-accent-soft)]/60 shadow-[var(--rw-shadow-md)]">
        <div aria-hidden="true" className="h-1 bg-[var(--color-primary)]" />

        {/* Trama de puntos. `mask-image` la desvanece para que no compita con
            el texto ni forme un borde duro donde termina. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
          style={{
            backgroundImage: "radial-gradient(var(--color-accent) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative p-6 py-10 md:p-12 md:py-16">
          <p className="u-animate-in text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-primary-dark)] md:text-xs">
            Consultora de Recursos Humanos · {BRAND.location}
          </p>

          <h1 className="u-animate-in mt-4 max-w-3xl text-[clamp(1.875rem,5.5vw,3.25rem)] font-semibold leading-[1.1] text-[var(--color-text)] [animation-delay:60ms]">
            Soluciones innovadoras para la gestión de talentos.
          </h1>

          <p className="u-animate-in mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--color-primary-dark)] [animation-delay:120ms] md:text-base">
            Brindamos soluciones estratégicas e integrales en Recursos Humanos que impulsan el
            crecimiento de empresas y profesionales: reclutamiento y selección de personal,
            consultoría, capacitación y desarrollo del talento.
          </p>

          {/* Los dos CTA hablan a las dos audiencias del negocio: la empresa que
              necesita cubrir un puesto y la persona que busca trabajo. En mobile
              ocupan el ancho completo, que es donde cae el pulgar. */}
          <div className="u-animate-in mt-8 flex flex-col gap-3 [animation-delay:180ms] sm:flex-row sm:flex-wrap">
            <Link href="/contacto" className="sm:w-auto">
              <Button className="w-full sm:w-auto">Iniciar una búsqueda</Button>
            </Link>
            <Link href="/empleos" className="sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Ver empleos disponibles
              </Button>
            </Link>
          </div>

          {/* Cierre del hero con los pilares del servicio. Reemplaza a la banda
              de métricas: comunica en qué se diferencia el trabajo sin afirmar
              ningún dato que no podamos sostener. */}
          <ul className="mt-10 grid gap-x-6 gap-y-4 border-t border-[var(--color-border)] pt-8 sm:grid-cols-3">
            {VALUES.slice(0, 3).map((value) => (
              <li key={value.title} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                  <Icon name={value.icon} className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-[var(--color-text)]">{value.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Servicios destacados --- */}
      <section className="u-reveal space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Qué hacemos</h2>
            <p className="mt-2 text-sm text-[var(--color-primary-dark)]">
              Acompañamos a empresas en sus búsquedas y a profesionales en su desarrollo.
            </p>
          </div>
          <Link
            href="/servicios"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:text-[var(--color-primary-strong)] hover:underline"
          >
            Ver todos los servicios
          </Link>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {SERVICES.slice(0, 3).map((service) => (
            <li key={service.title}>
              <Card className="h-full">
                <span className="text-[var(--color-primary)]">
                  <Icon name={service.icon} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">
                  {service.description}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Enfoque y valores --- */}
      <section className="u-reveal rounded-[var(--rw-radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--rw-shadow-sm)] md:p-10">
        <h2 className="text-2xl font-semibold md:text-3xl">Nuestro enfoque</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[var(--color-primary-dark)] md:text-base">
          Trabajamos con un enfoque personalizado, utilizando metodologías actualizadas y
          herramientas innovadoras para conectar el talento adecuado con las oportunidades
          correctas.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <li
              key={value.title}
              className="flex items-start gap-3 rounded-[var(--rw-radius-md)] bg-[var(--color-surface-subtle)] p-4"
            >
              <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                <Icon name={value.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{value.title}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link href="/nosotros">
            <Button variant="secondary" className="w-full sm:w-auto">
              Conocer al equipo
            </Button>
          </Link>
        </div>
      </section>

      {/* --- Cierre ---
          La página terminaba en un botón secundario, sin cierre. Un CTA final
          recupera a quien scrolleó hasta abajo, que es justamente quien más
          interés mostró. */}
      <section className="u-reveal rounded-[var(--rw-radius-xl)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent-soft)]/70 to-[var(--color-surface)] p-8 text-center shadow-[var(--rw-shadow-sm)] md:p-12">
        <h2 className="text-xl font-semibold md:text-2xl">¿Necesitás cubrir una posición?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-primary-dark)]">
          Contanos qué perfil estás buscando y coordinamos una reunión para relevarlo.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contacto">
            <Button className="w-full sm:w-auto">Contactanos</Button>
          </Link>
          <Link href="/servicios">
            <Button variant="secondary" className="w-full sm:w-auto">
              Ver el proceso de selección
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
