import {
  escapeHtml,
  internalRecipient,
  isEmailConfigured,
  renderLayout,
  renderRows,
  sendEmail,
} from "@/lib/services/email";
import { OTHER_SERVICE, type ContactInput } from "@/lib/validators/contact";

/**
 * Envío del formulario de contacto.
 *
 * El transporte (Resend, escapado de HTML, plantilla base) vive en
 * `email.ts` y lo comparte con las notificaciones de postulaciones. Acá sólo
 * queda lo propio de este correo: qué campos se muestran y cómo.
 */

export function isContactEmailConfigured(): boolean {
  return isEmailConfigured();
}

function resolvedService(input: ContactInput): string {
  return input.service === OTHER_SERVICE && input.serviceOther
    ? `${OTHER_SERVICE}: ${input.serviceOther}`
    : input.service;
}

export async function sendContactEmail(input: ContactInput): Promise<void> {
  const rows: [string, string][] = [
    ["Nombre", input.fullName],
    ["Email", input.email],
    ["Teléfono", input.phone],
    ["Empresa", input.company?.trim() || "—"],
    ["Servicio de interés", resolvedService(input)],
  ];

  const messageBlock = `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #dde5e6">
      <p style="color:#5a7579;font-size:14px;margin:0 0 8px">Mensaje</p>
      <p style="color:#1f2937;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(input.message)}</p>
    </div>`;

  await sendEmail({
    to: internalRecipient(),
    subject: `Consulta web — ${input.fullName}`,
    // reply_to con el correo de quien consulta: responder desde el cliente de
    // mail le escribe directamente a la persona, sin copiar la dirección a
    // mano. Es el detalle que hace que el formulario se use de verdad.
    replyTo: input.email,
    html: renderLayout(
      "Nueva consulta desde el sitio",
      "Formulario de contacto del sitio web",
      renderRows(rows) + messageBlock,
    ),
    text: [
      "Nueva consulta desde el sitio",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
      "",
      "Mensaje:",
      input.message,
    ].join("\n"),
  });
}
