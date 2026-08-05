import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SocialLinks } from "@/components/layout/SocialLinks";
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
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold md:text-4xl">Contacto</h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--color-primary-dark)]">
          Escribinos para iniciar una búsqueda, consultar por nuestros servicios o pedir asesoramiento sobre tu perfil
          profesional.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex h-full flex-col">
          <span className="text-[var(--color-primary)]">
            <Icon name="mail" />
          </span>
          <h2 className="mt-3 text-lg font-semibold">Email</h2>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-1 text-sm text-[var(--color-primary-dark)] underline underline-offset-2 hover:text-[var(--color-primary)]"
          >
            {CONTACT.email}
          </a>
        </Card>

        <Card className="flex h-full flex-col">
          <span className="text-[var(--color-primary)]">
            <Icon name="person" />
          </span>
          <h2 className="mt-3 text-lg font-semibold">Teléfono</h2>
          <a
            href={CONTACT.phoneHref}
            className="mt-1 text-sm text-[var(--color-primary-dark)] underline underline-offset-2 hover:text-[var(--color-primary)]"
          >
            {CONTACT.phone}
          </a>
        </Card>
      </section>

      <section className="rounded-lg border border-[var(--color-accent)] bg-white p-6">
        <h2 className="text-lg font-semibold">Dónde estamos</h2>
        <p className="mt-1 text-sm text-[var(--color-primary-dark)]">{BRAND.location}</p>

        <h3 className="mt-5 text-sm font-semibold">Redes sociales</h3>
        <div className="mt-2">
          <SocialLinks />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--color-accent)] bg-white p-6">
        <h2 className="text-lg font-semibold">¿Buscás trabajo?</h2>
        <p className="mt-1 text-sm text-[var(--color-primary-dark)]">
          Mirá las búsquedas abiertas y postulate en línea. También podés consultar cómo tratamos tus datos en nuestra{" "}
          <Link href="/privacidad" className="underline hover:text-[var(--color-primary)]">
            política de privacidad
          </Link>
          .
        </p>
        <Link
          href="/empleos"
          className="mt-3 inline-block text-sm font-semibold text-[var(--color-primary-dark)] hover:underline"
        >
          Ver empleos disponibles
        </Link>
      </section>
    </div>
  );
}
