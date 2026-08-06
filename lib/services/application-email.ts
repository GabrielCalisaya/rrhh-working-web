import { BRAND } from "@/lib/content/institucional";
import { logError } from "@/lib/observability/log";
import {
  escapeHtml,
  internalRecipient,
  isEmailConfigured,
  renderLayout,
  renderRows,
  sendEmail,
} from "@/lib/services/email";
import { siteUrl } from "@/lib/utils/site-url";

/**
 * Notificaciones de las postulaciones.
 *
 * PROBLEMA QUE RESUELVE
 * Hasta ahora una postulación entraba a Supabase y ahí terminaba: nadie recibía
 * nada. El equipo tenía que acordarse de entrar al panel a revisar, y una
 * búsqueda urgente podía tener candidatos esperando días sin que se enteraran.
 * El candidato tampoco recibía señal de que su envío había llegado.
 *
 * Se mandan dos correos distintos y con distinta prioridad:
 *
 * 1. AVISO INTERNO al equipo. Es el que importa: sin él, el circuito no cierra.
 * 2. CONFIRMACIÓN al candidato. Es cortesía y baja las consultas de "¿les
 *    llegó mi CV?". Depende de tener un dominio verificado en Resend (ver
 *    abajo), así que puede fallar sin que eso sea un problema.
 */

type ApplicationNotification = {
  applicationId: string;
  vacancyTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  candidateCity?: string | null;
  skills: string[];
  coverLetter?: string | null;
  hasCv: boolean;
  /** El perfil superó el umbral de coincidencia configurado. */
  isHighMatch?: boolean;
};

/**
 * Enlace directo a la postulación en el panel.
 *
 * `siteUrl()` cae en localhost sólo en desarrollo; en Vercel siempre resuelve a
 * una URL real, aunque no se haya configurado NEXT_PUBLIC_SITE_URL. En
 * desarrollo se omite el botón, porque un enlace a localhost dentro de un mail
 * no le sirve a nadie.
 */
function panelUrl(): string | null {
  const base = siteUrl();
  if (base.startsWith("http://localhost")) return null;
  return `${base}/admin/postulaciones`;
}

function buildInternalEmail(data: ApplicationNotification) {
  const rows: [string, string][] = [
    ["Búsqueda", data.vacancyTitle],
    ["Candidato", data.candidateName],
    ["Email", data.candidateEmail],
    ["Teléfono", data.candidatePhone?.trim() || "—"],
    ["Localidad", data.candidateCity?.trim() || "—"],
    ["Experiencia", data.skills.join(", ") || "—"],
    ["CV adjunto", data.hasCv ? "Sí" : "No"],
  ];

  const letter = data.coverLetter?.trim()
    ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #dde5e6">
         <p style="color:#5a7579;font-size:14px;margin:0 0 8px">Lo que contó de sí</p>
         <p style="color:#1f2937;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(data.coverLetter)}</p>
       </div>`
    : "";

  const url = panelUrl();
  const link = url
    ? `<p style="margin-top:24px">
         <a href="${url}" style="display:inline-block;background:#5a7579;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">Ver en el panel</a>
       </p>`
    : "";

  return {
    // El prefijo permite filtrar o priorizar desde la bandeja, sin abrir.
    subject: data.isHighMatch
      ? `Nueva postulación (perfil destacado) — ${data.vacancyTitle}`
      : `Nueva postulación — ${data.vacancyTitle}`,
    html: renderLayout(
      "Nueva postulación",
      `${data.candidateName} se postuló a "${data.vacancyTitle}"`,
      renderRows(rows) + letter + link,
    ),
    text: [
      `Nueva postulación a: ${data.vacancyTitle}`,
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
      "",
      data.coverLetter?.trim() ? `Mensaje:\n${data.coverLetter}` : "",
      url ?? "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function buildCandidateEmail(data: ApplicationNotification) {
  return {
    subject: `Recibimos tu postulación — ${data.vacancyTitle}`,
    html: renderLayout(
      "Recibimos tu postulación",
      `Gracias por postularte a "${data.vacancyTitle}"`,
      `<p style="color:#1f2937;font-size:14px;line-height:1.6;margin:0">
         Hola ${escapeHtml(data.candidateName.split(" ")[0] ?? "")}, tu postulación llegó correctamente.
       </p>
       <p style="color:#1f2937;font-size:14px;line-height:1.6;margin:16px 0 0">
         Vamos a revisar tu perfil junto con el resto de los que se presentaron. Si avanzás en el
         proceso, te contactamos a este mismo correo. No hace falta que hagas nada más.
       </p>
       <p style="color:#5a7579;font-size:13px;line-height:1.6;margin:24px 0 0">
         ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.location)}
       </p>`,
    ),
    text: [
      `Hola ${data.candidateName.split(" ")[0] ?? ""},`,
      "",
      `Recibimos tu postulación a "${data.vacancyTitle}".`,
      "Si avanzás en el proceso, te contactamos a este mismo correo.",
      "",
      `${BRAND.name} · ${BRAND.location}`,
    ].join("\n"),
  };
}

/**
 * Envía los avisos de una postulación.
 *
 * NUNCA lanza. Se llama después de que la postulación ya se guardó, y en ese
 * punto el dato crítico está a salvo: hacer fallar la respuesta porque el
 * servidor de correo tuvo un problema haría que el candidato viera un error y
 * volviera a postularse, cuando en realidad su postulación entró bien.
 *
 * Los fallos se registran con contexto para poder rastrearlos después.
 */
export async function notifyApplication(data: ApplicationNotification): Promise<void> {
  if (!isEmailConfigured()) {
    // Sin API key no es un error: es una instalación todavía sin configurar.
    // Se deja constancia para que no pase inadvertido en producción.
    logError(
      "application-email.not-configured",
      new Error("RESEND_API_KEY ausente: la postulación no generó aviso"),
      { applicationId: data.applicationId },
    );
    return;
  }

  const internal = buildInternalEmail(data);

  try {
    await sendEmail({
      to: internalRecipient(),
      subject: internal.subject,
      html: internal.html,
      text: internal.text,
      // Responder desde el cliente de correo escribe directo al candidato.
      replyTo: data.candidateEmail,
    });
  } catch (error) {
    logError("application-email.internal", error, { applicationId: data.applicationId });
  }

  /**
   * La confirmación al candidato va en su propio try: mientras no haya un
   * dominio verificado en Resend, este envío falla siempre (Resend sólo permite
   * escribirle a la casilla dueña de la cuenta). El aviso interno, que es el
   * importante, no debe verse afectado por eso.
   */
  const candidateEmail = buildCandidateEmail(data);

  try {
    await sendEmail({
      to: data.candidateEmail,
      subject: candidateEmail.subject,
      html: candidateEmail.html,
      text: candidateEmail.text,
      replyTo: internalRecipient(),
    });
  } catch (error) {
    logError("application-email.candidate", error, { applicationId: data.applicationId });
  }
}
