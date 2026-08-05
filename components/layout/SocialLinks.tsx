// Perfiles confirmados por el cliente. El portafolio menciona además LinkedIn y
// CompuTrabajo como canales de difusión de búsquedas, pero sin usuario asociado.
const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/rrhhworking",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/rrhh.working",
  },
] as const;

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4 text-sm">
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[var(--color-primary-dark)] hover:underline"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
