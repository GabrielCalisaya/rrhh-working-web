/**
 * Crédito de autoría del sitio.
 *
 * La convención en trabajos a medida es una línea discreta al pie: texto chico,
 * color secundario, con enlace al desarrollador. Nunca compite con la marca del
 * cliente ni con su copyright — el sitio es de la consultora, la firma es una
 * atribución, no un anuncio.
 *
 * Además de la atribución, funciona como canal de trabajo: quien ve el sitio y
 * quiere algo parecido llega hasta vos con un clic. Por eso conviene que el
 * enlace no lleve `nofollow`: es un vínculo legítimo que le suma posicionamiento
 * al sitio propio.
 */

export const DEVELOPER = {
  name: "New Tech",

  /**
   * Sitio, portfolio o perfil profesional. Si queda vacío, el crédito se
   * muestra como texto plano en lugar de enlace.
   */
  url: "https://www.newtech.net.ar/",

  /**
   * Ruta del isotipo en /public. Opcional: sin logo, el crédito muestra sólo el
   * nombre y se ve igual de prolijo.
   *
   * Recomendado: SVG, o PNG con fondo transparente de 64px de lado como mínimo.
   * Se muestra a 16px, así que un logo con mucho detalle no se va a leer.
   */
  logo: "/newtech.svg" as string,
} as const;
