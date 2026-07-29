import { z } from "zod";

export const vacancySchema = z.object({
  title: z.string().min(3).max(120),
  city: z.string().min(2).max(80),
  modality: z.enum(["Presencial", "Híbrido", "Remoto"]),
  employment_type: z.enum(["Full-time", "Part-time", "Contrato", "Pasantía"]),
  seniority: z.enum(["Junior", "Semi Senior", "Senior", "Lead"]),
  description: z.string().min(20),
  requirements: z.array(z.string().min(2)).min(1),
  nice_to_have: z.array(z.string().min(2)).default([]),
  status: z.enum(["open", "closed", "draft"]).default("draft"),
});

export const vacancyUpdateSchema = vacancySchema.partial().extend({
  id: z.string().uuid(),
});

export type VacancyInput = z.infer<typeof vacancySchema>;
export type VacancyUpdateInput = z.infer<typeof vacancyUpdateSchema>;
