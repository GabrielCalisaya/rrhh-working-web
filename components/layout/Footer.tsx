import Link from "next/link";
import { SocialLinks } from "@/components/layout/SocialLinks";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--color-accent)] py-6 text-sm text-[var(--color-primary-dark)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} RRHH Working</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacidad" className="underline hover:text-[var(--color-primary)]">
            Privacidad y datos personales
          </Link>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
