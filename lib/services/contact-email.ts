import { CONTACT } from "@/lib/content/institucional";
import { OTHER_SERVICE, type ContactInput } from "@/lib/validators/contact";

/**
 * Envío del formulario de contacto por email.
 *
 * Se eligió Resend y se lo llama con `fetch` contra su API HTTP, sin instalar
 * el SDK: son cuatro campos en un JSON y el paquete sólo agregaría peso al
 * despliegue para envolver lo mismo.
 *
 * Sobre el plan gratuito: 3.000 envíos por mes y 100 por día, de sobra para el
 * volumen de consultas de una consultora regional. Sin un dominio propio
 * verificado, Resend sólo permite enviar a la casilla dueña de la cuenta — que
 * en este caso es justo el destino fijo del formulario, así que la limitación
 * no molesta. Cuando haya dominio propio, basta con verificarlo y cambiar
 * RESEND_FROM por una dirección de ese dominio.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Sin dominio verificado, Resend obliga a usar esta dirección de remitente. */
const DEFAULT_FROM = "RRHH Working <onboarding@resend.dev>";

export function isContactEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Escapa el contenido antes de armar el HTML del mail.
 *
 * El cuerpo lo escribe un desconocido desde un formulario público: sin escapar,
 * cualquiera podría inyectar etiquetas en el correo que abre la consultora.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(input: ContactInput): string {
  const service =
    input.service === OTHER_SERVICE && input.serviceOther
      ? `${OTHER_SERVICE}: ${input.serviceOther}`
      : input.service;

  const rows: [string, string][] = [
    ["Nombre", input.fullName],
    ["Email", input.email],
    ["Teléfono", input.phone],
    ["Empresa", input.company?.trim() || "—"],
    ["Servicio de interés", service],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr>
           <td style="padding:6px 12px 6px 0;color:#5a7579;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
           <td style="padding:6px 0;color:#1f2937"><strong>${escapeHtml(value)}</strong></td>
         </tr>`,
    )
    .join("");

  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px">
      <h2 style="color:#1f2937;margin:0 0 4px">Nueva consulta desde el sitio</h2>
      <p style="color:#5a7579;margin:0 0 20px;font-size:14px">Formulario de contacto de rrhhworking</p>
      <table style="border-collapse:collapse;font-size:14px">${rowsHtml}</table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #dde5e6">
        <p style="color:#5a7579;font-size:14px;margin:0 0 8px">Mensaje</p>
        <p style="color:#1f2937;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(input.message)}</p>
      </div>
    </div>`;
}

/** Versión en texto plano, para clientes de correo que no muestran HTML. */
function buildText(input: ContactInput): string {
  const service =
    input.service === OTHER_SERVICE && input.serviceOther
      ? `${OTHER_SERVICE}: ${input.serviceOther}`
      : input.service;

  return [
    "Nueva consulta desde el sitio",
    "",
    `Nombre: ${input.fullName}`,
    `Email: ${input.email}`,
    `Teléfono: ${input.phone}`,
    `Empresa: ${input.company?.trim() || "—"}`,
    `Servicio de interés: ${service}`,
    "",
    "Mensaje:",
    input.message,
  ].join("\n");
}

export async function sendContactEmail(input: ContactInput): Promise<void> {
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
      to: [process.env.CONTACT_TO_EMAIL || CONTACT.email],
      // reply_to con el correo de quien consulta: responder desde el cliente de
      // mail le escribe directamente a la persona, sin copiar la dirección a
      // mano. Es el detalle que hace que el formulario se use de verdad.
      reply_to: input.email,
      subject: `Consulta web — ${input.fullName}`,
      html: buildHtml(input),
      text: buildText(input),
    }),
  });

  if (!response.ok) {
    // El cuerpo de Resend trae el motivo (clave inválida, destinatario no
    // permitido). Va al log del servidor, nunca a la respuesta del navegador.
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend respondió ${response.status}: ${detail.slice(0, 300)}`);
  }
}
