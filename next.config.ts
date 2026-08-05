import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Origen de Supabase, para no abrir connect-src a todo internet.
// Si la variable falta en build time, se cae a https: (permisivo pero funcional).
const supabaseOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return "https:";
  try {
    const { origin, host } = new URL(raw);
    return `${origin} wss://${host}`;
  } catch {
    return "https:";
  }
})();

const TURNSTILE = "https://challenges.cloudflare.com";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' es necesario porque Next inyecta scripts de bootstrap sin
  // nonce. Aun así el CSP bloquea scripts de terceros no listados.
  // Mejora pendiente: nonce por request vía middleware (ver checklist).
  `script-src 'self' 'unsafe-inline' ${TURNSTILE}${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind y Next inyectan estilos inline.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  `frame-src ${TURNSTILE}`,
  "object-src 'none'",
  "base-uri 'self'",
  // Refuerza el arreglo del open redirect: los formularios no pueden postear fuera.
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
