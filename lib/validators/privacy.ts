import { z } from "zod";

export const deletionRequestSchema = z.object({
  email: z.string().email("Ingresá un email válido").max(160),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export const deletionResolutionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["complete", "reject"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type DeletionRequestInput = z.infer<typeof deletionRequestSchema>;
export type DeletionResolutionInput = z.infer<typeof deletionResolutionSchema>;
