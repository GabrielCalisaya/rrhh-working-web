import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { Icon } from "@/components/ui/Icon";
import { BRAND, CONTACT } from "@/lib/content/institucional";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Contactate con ${BRAND.name}, consultora de Recursos Humanos en ${BRAND.location}. Email ${CONTACT.email} · Tel. ${CONTACT.phone}.`,
  openGraph: {
    title: `Contacto | ${BRAND.name}`,
    description: `Consultora de Recursos Humanos en ${BRAND.location}.`,
  },
};

export default function ContactoPage() {
  return (
    <div className="space-y-12 md:space-y-16">
      <section className="space-y-3">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
          {BRAND.location}
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Contacto</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--color-primary-dark)] md:text-base">
          Escribinos para iniciar una búsqueda, consultar por nuestros servicios o pedir
          asesoramiento sobre tu perfil profesional.
        </p>
      </section>

      {/* Formulario primero, datos directos después.
          Antes la página sólo mostraba email y teléfono: quien quería contratar
          tenía que salir del sitio a abrir su cliente de correo y redactar de
          cero, y buena parte de esas consultas no volvía. Los canales directos
          siguen visibles para quien prefiera el teléfono, pero dejan de ser la
          única salida posible. */}
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">Contanos qué necesitás</h2>
          <p className="mt-2 text-sm text-[var(--color-primary-dark)]">
            Completá el formulario y te respondemos por correo. Los campos con * son obligatorios.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        {/* En desktop la columna acompaña al formulario mientras se scrollea; en
            mobile cae debajo, donde no compite por la atención. */}
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--rw-shadow-sm)]">
            <h2 className="text-base font-semibold">Canales directos</h2>

            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="group flex items-start gap-3 text-sm transition-colors hover:text-[var(--color-primary-strong)]"
                >
                  <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                    <Icon name="mail" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-[var(--color-primary-dark)]">Email</span>
                    <span className="block break-words font-medium group-hover:underline">
                      {CONTACT.email}
                    </span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={CONTACT.phoneHref}
                  className="group flex items-start gap-3 text-sm transition-colors hover:text-[var(--color-primary-strong)]"
                >
                  <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                    <Icon name="person" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-[var(--color-primary-dark)]">Teléfono</span>
                    <span className="block font-medium group-hover:underline">{CONTACT.phone}</span>
                  </span>
                </a>
              </li>

              <li className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
                  <Icon name="pin" className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs text-[var(--color-primary-dark)]">
                    Dónde estamos
                  </span>
                  <span className="block font-medium">{BRAND.location}</span>
                </span>
              </li>
            </ul>

            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
                Redes sociales
              </h3>
              <div className="mt-3">
                <SocialLinks />
              </div>
            </div>
          </div>

          <div className="rounded-[var(--rw-radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-6">
            <h2 className="text-base font-semibold">¿Buscás trabajo?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-primary-dark)]">
              Este formulario es para empresas y consultas sobre servicios. Si buscás empleo, mirá
              las búsquedas abiertas y postulate en línea.
            </p>
            <Link
              href="/empleos"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:text-[var(--color-primary-strong)] hover:underline"
            >
              Ver empleos disponibles
              <Icon name="arrow-left" className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
