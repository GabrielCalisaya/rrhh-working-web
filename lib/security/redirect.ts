export const DEFAULT_POST_LOGIN_PATH = "/admin";

// Caracteres de control (NUL, \t, \n, \r, DEL) usados para romper parsers de URL.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * Normaliza el parámetro `next` de la query string a una ruta interna segura.
 *
 * El parámetro llega del cliente y no es confiable. Concatenarlo al origin
 * (`${origin}${next}`) permite escapar del dominio: `?next=@evil.com` produce
 * `https://tu-dominio.com@evil.com`, donde el dominio legítimo se interpreta
 * como userinfo y el host real pasa a ser el del atacante.
 *
 * Solo se aceptan rutas relativas con un único slash inicial. Cualquier otra
 * cosa (URL absoluta, protocol-relative `//host`, backslash, control chars)
 * cae al fallback.
 */
export function resolveSafeNextPath(
  next: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH,
): string {
  if (!next) {
    return fallback;
  }

  if (CONTROL_CHARS.test(next)) {
    return fallback;
  }

  // Debe ser relativa: un solo "/" inicial, sin "//" ni "/\" (protocol-relative).
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }

  // Un backslash en cualquier posición: varios navegadores lo normalizan a "/".
  if (next.includes("\\")) {
    return fallback;
  }

  try {
    // Base sentinela: si el resultado cambia de origin, la ruta no era relativa.
    const base = "https://sentinel.invalid";
    const parsed = new URL(next, base);

    if (parsed.origin !== base) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
