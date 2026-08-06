import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils/site-url";

/**
 * robots.txt
 *
 * Next lo genera a partir de este archivo y lo sirve en /robots.txt.
 *
 * Las rutas bloqueadas no son un control de seguridad —el panel lo protegen el
 * middleware, los guards y las políticas RLS— sino de higiene de indexación: sin
 * esto Google gasta presupuesto de rastreo en pantallas de login y endpoints de
 * API que no aportan nada, y puede llegar a mostrarlas en resultados.
 *
 * `/postular/` queda deliberadamente ABIERTO: son las páginas de cada búsqueda,
 * justo las que queremos que aparezcan en Google Jobs.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/auth/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
