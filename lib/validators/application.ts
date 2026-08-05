import { z } from "zod";

export const applicationStatusSchema = z.enum(["new", "review", "shortlist", "rejected", "hired"]);

export const applicationSchema = z.object({
  vacancyId: z.string().uuid(),
  candidate: z.object({
    fullName: z.string().min(3).max(120),
    email: z.string().email(),
    phone: z.string().min(6).max(30).optional().or(z.literal("")),
    city: z.string().max(80).optional().or(z.literal("")),
    linkedinUrl: z.string().url().optional().or(z.literal("")),
    portfolioUrl: z.string().url().optional().or(z.literal("")),
    skills: z.array(z.string().min(1)).min(1),
    consent: z.literal(true),
  }),
  coverLetter: z.string().max(2000).optional().or(z.literal("")),
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
