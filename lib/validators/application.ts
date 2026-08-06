import { z } from "zod";

export const applicationStatusSchema = z.enum(["new", "review", "shortlist", "rejected", "hired"]);

/**
 * Los mensajes están escritos en español y en segunda persona.
 *
 * Sin mensajes propios, Zod responde en inglés y con vocabulario de
 * programador: al candidato le llegaba "Invalid email" o "String must contain
 * at least 3 character(s)" como única explicación de por qué no podía
 * postularse.
 */
export const applicationSchema = z.object({
  vacancyId: z.string().uuid(),
  candidate: z.object({
    fullName: z
      .string()
      .min(3, "Escribí tu nombre y apellido.")
      .max(120, "El nombre es demasiado largo."),
    email: z.string().email("Revisá el correo: no parece una dirección válida."),
    phone: z
      .string()
      .min(6, "El teléfono parece incompleto.")
      .max(30, "El teléfono es demasiado largo.")
      .optional()
      .or(z.literal("")),
    city: z.string().max(80, "El nombre de la localidad es demasiado largo.").optional().or(z.literal("")),
    linkedinUrl: z
      .string()
      .url("El enlace de LinkedIn tiene que empezar con https://")
      .optional()
      .or(z.literal("")),
    portfolioUrl: z
      .string()
      .url("El enlace tiene que empezar con https://")
      .optional()
      .or(z.literal("")),
    skills: z
      .array(z.string().min(1))
      .min(1, "Marcá o agregá al menos una cosa que sepas hacer."),
    consent: z.literal(true, {
      message: "Necesitamos tu consentimiento para procesar la postulación.",
    }),
  }),
  coverLetter: z
    .string()
    .max(2000, "El texto no puede superar los 2000 caracteres.")
    .optional()
    .or(z.literal("")),
  cvFilePath: z
    .string()
    .regex(/^cvs\/[0-9a-f-]+\.pdf$/i, "Ruta de CV inválida")
    .optional(),
});

export const applicationStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: applicationStatusSchema,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationStatusUpdateInput = z.infer<typeof applicationStatusUpdateSchema>;
