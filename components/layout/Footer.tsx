import Link from "next/link";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { BRAND } from "@/lib/content/institucional";
import { DEVELOPER } from "@/lib/content/developer";

/** Crédito de autoría: nombre, y logo si está configurado. */
function DeveloperCredit() {
  const content = (
    <>
      {/* El isotipo va inline y no con <Image> porque usa `currentColor`: así
          hereda el color del pie y se adapta solo al tema claro y al oscuro.
          Servido como archivo, el navegador lo pintaría siempre del mismo
          color y en modo oscuro no se vería. */}
      {DEVELOPER.logo ? (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 opacity-75 transition-opacity group-hover:opacity-100"
        >
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" />
          <path
            d="M19 14 9 24l10 10M29 14l10 10-10 10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <span>
        Sitio desarrollado por <span className="font-medium">{DEVELOPER.name}</span>
      </span>
    </>
  );

  if (!DEVELOPER.url) {
    return <span className="inline-flex items-center gap-1.5">{content}</span>;
  }

  return (
    <a
      href={DEVELOPER.url}
      target="_blank"
      // noopener por seguridad. Sin `nofollow` a propósito: es un enlace
      // legítimo y le suma posicionamiento al sitio del desarrollador.
      rel="noopener"
      className="group inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-[var(--color-primary-strong)] md:min-h-0"
    >
      {content}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-primary-dark)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND.name}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/privacidad"
            className="underline underline-offset-4 hover:text-[var(--color-primary-strong)]"
          >
            Privacidad y datos personales
          </Link>
          <SocialLinks />
        </div>
      </div>

      {/* Segunda línea, separada y más tenue que el copyright del cliente: la
          jerarquía deja claro de quién es el sitio y quién lo hizo. */}
      <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
        <DeveloperCredit />
      </div>
    </footer>
  );
}
