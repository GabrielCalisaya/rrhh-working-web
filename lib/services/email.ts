import { CONTACT } from "@/lib/content/institucional";

/**
 * Transporte de email del proyecto.
 *
 * Se llama a la API HTTP de Resend con `fetch`, sin instalar el SDK: son cuatro
 * campos en un JSON y el paquete sólo agregaría peso al despliegue.
 *
 * Este módulo sólo sabe ENVIAR. El contenido de cada mail lo arman los
 * servicios que lo usan (`contact-email.ts`, `application-email.ts`), para que
 * cambiar de proveedor sea tocar un archivo y no cinco.
 *
 * Plan gratuito: 3.000 envíos/mes, 100/día. Sin un dominio propio verificado,
 * Resend sólo permite enviar a la casilla dueña de la cuenta — que es el destino
 * de las notificaciones internas. Ojo: por eso mismo, la confirmación al
 * candidato NO va a salir hasta que haya un dominio verificado (ver
 * `application-email.ts`).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Sin dominio verificado, Resend obliga a usar esta dirección de remitente. */
const DEFAULT_FROM = "RRHH Working <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Casilla interna a la que llegan las notificaciones del sitio. */
export function internalRecipient(): string {
  return process.env.CONTACT_TO_EMAIL || CONTACT.email;
}

/**
 * Escapa el contenido antes de armar el HTML.
 *
 * Buena parte de estos textos los escribe un desconocido desde un formulario
 * público: sin escapar, cualquiera podría inyectar etiquetas en el correo que
 * abre la consultora.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Tabla de etiqueta/valor con el estilo compartido por todos los mails. */
export function renderRows(rows: [string, string][]): string {
  const body = rows
    .map(
      ([label, value]) =>
        `<tr>
           <td style="padding:6px 12px 6px 0;color:#5a7579;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
           <td style="padding:6px 0;color:#1f2937"><strong>${escapeHtml(value)}</strong></td>
         </tr>`,
    )
    .join("");

  return `<table style="border-collapse:collapse;font-size:14px">${body}</table>`;
}

export function renderLayout(title: string, subtitle: string, content: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px">
      <h2 style="color:#1f2937;margin:0 0 4px">${escapeHtml(title)}</h2>
      <p style="color:#5a7579;margin:0 0 20px;font-size:14px">${escapeHtml(subtitle)}</p>
      ${content}
    </div>`;
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no está configurada");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    // El cuerpo de Resend trae el motivo (clave inválida, destinatario no
    // permitido). Va al log del servidor, nunca a la respuesta del navegador.
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend respondió ${response.status}: ${detail.slice(0, 300)}`);
  }
}
