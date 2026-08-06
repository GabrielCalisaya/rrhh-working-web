/**
 * URL pública del sitio.
 *
 * La necesitan el sitemap, el robots.txt y el enlace al panel de los correos.
 * Se resuelve en tres pasos, del más confiable al más circunstancial:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — la que se configura a mano. Es la única que
 *    apunta al dominio propio cuando lo haya, así que gana siempre.
 * 2. `VERCEL_URL` — la asigna Vercel sola en cada despliegue. Sirve de red de
 *    seguridad para que el sitemap nunca quede con URLs de localhost si alguien
 *    se olvidó de cargar la variable. Ojo: en cada deploy de preview cambia, y
 *    por eso no reemplaza a la primera.
 * 3. localhost — desarrollo.
 *
 * Siempre devuelve sin barra final, para poder concatenar rutas sin duplicarla.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  // Vercel la expone sin protocolo (ej. "mi-app.vercel.app").
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
