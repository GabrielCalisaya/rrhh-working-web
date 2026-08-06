import { z } from "zod";
import { SERVICES } from "@/lib/content/institucional";

/**
 * Opciones de "Servicio de interés".
 *
 * Se derivan de SERVICES en vez de duplicarse: si mañana la consultora agrega o
 * renombra un servicio, el desplegable del formulario acompaña solo. Duplicar
 * esta lista garantizaba que en algún momento las dos versiones se separaran.
 */
export const OTHER_SERVICE = "Otro";

export const CONTACT_SERVICE_OPTIONS: readonly string[] = [
  ...SERVICES.map((service) => service.title),
  OTHER_SERVICE,
];

/**
 * Los mensajes de error están escritos en español y en segunda persona, igual
 * que el resto del sitio. Zod, sin mensajes propios, responde en inglés
 * ("String must contain at least 3 character(s)"), que es exactamente lo que le
 * llegaba al usuario en el formulario de postulación.
 */
export const contactSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Escribí tu nombre completo.")
      .max(120, "El nombre es demasiado largo."),
    email: z.string().trim().email("Revisá el correo: no parece una dirección válida."),
    phone: z
      .string()
      .trim()
      .min(6, "Escribí un teléfono de contacto.")
      .max(30, "El teléfono es demasiado largo."),
    company: z.string().trim().max(120, "El nombre de la empresa es demasiado largo.").optional(),
    service: z
      .string()
      .refine((value) => CONTACT_SERVICE_OPTIONS.includes(value), "Elegí un servicio de la lista."),
    serviceOther: z.string().trim().max(120, "Resumilo un poco más.").optional(),
    message: z
      .string()
      .trim()
      .min(10, "Contanos un poco más: al menos 10 caracteres.")
      .max(2000, "El mensaje no puede superar los 2000 caracteres."),
    consent: z.literal(true, {
      message: "Necesitamos tu consentimiento para poder contactarte.",
    }),
    /**
     * Honeypot. Es un campo invisible para las personas: sólo lo completan los
     * bots que rellenan todo lo que encuentran en el DOM. Si viene con algo, la
     * petición se descarta.
     *
     * Va además de Turnstile, no en su lugar: frena el spam automático simple
     * sin costo ni fricción, incluso con el captcha desactivado.
     */
    website: z.string().max(0, "Envío inválido.").optional(),
  })
  /**
   * "Otro" sin especificar deja una consulta que no dice qué se necesita. La
   * validación cruzada se hace acá y no en el componente para que valga también
   * del lado del servidor, donde es la única que no se puede saltear.
   */
  .refine((data) => data.service !== OTHER_SERVICE || Boolean(data.serviceOther?.trim()), {
    message: "Contanos brevemente qué servicio necesitás.",
    path: ["serviceOther"],
  });

export type ContactInput = z.infer<typeof contactSchema>;
