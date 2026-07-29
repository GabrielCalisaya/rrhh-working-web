import { SocialLinks } from "@/components/layout/SocialLinks";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--color-accent)] py-6 text-sm text-[var(--color-primary-dark)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} RRHH Working</p>
        <SocialLinks />
      </div>
    </footer>
  );
}
