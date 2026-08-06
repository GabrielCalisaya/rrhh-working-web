import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BRAND } from "@/lib/content/institucional";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { siteUrl } from "@/lib/utils/site-url";

/**
 * Inter, la tipografía que `globals.css` ya asumía pero que nunca se cargaba.
 *
 * `next/font` la auto-hospeda en el propio dominio durante el build, así que no
 * hace falta tocar la CSP (`font-src 'self'` la cubre) ni se agrega una request
 * a un tercero. `display: swap` evita el texto invisible mientras carga.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const DESCRIPTION =
  "Consultora de Recursos Humanos en San Salvador de Jujuy. Reclutamiento y selección de personal, difusión de ofertas laborales, armado de CV y optimización de perfiles profesionales.";

export const metadata: Metadata = {
  /**
   * Base para resolver las URLs relativas de Open Graph.
   *
   * Sin esto Next avisa en cada build y, lo importante, la imagen de
   * `opengraph-image.png` se referencia con una ruta relativa: WhatsApp,
   * LinkedIn y Twitter necesitan una URL absoluta para poder descargarla, así
   * que la vista previa del enlace quedaba sin imagen.
   */
  metadataBase: new URL(siteUrl()),
  // `template` agrega el sufijo de marca a cada página que define su propio title.
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND.name,
  keywords: [
    "recursos humanos",
    "consultora RRHH",
    "selección de personal",
    "reclutamiento",
    "empleos Jujuy",
    "San Salvador de Jujuy",
    "armado de CV",
    "optimización LinkedIn",
  ],
  authors: [{ name: BRAND.name }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: BRAND.name,
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: el script de abajo escribe `data-theme` en <html>
    // antes de que React hidrate, así que el atributo del cliente no coincide
    // con el del servidor. Es intencional y está acotado a este elemento.
    <html lang="es-AR" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:shadow"
        >
          Saltar al contenido
        </a>
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 md:px-8">
          <Header />
          <main id="contenido" className="flex-1 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
