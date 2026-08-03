import { z } from "zod";

export const profileRoleSchema = z.enum(["admin", "recruiter"]);

export const profileRoleUpdateSchema = z.object({
  id: z.string().uuid(),
  role: profileRoleSchema,
});

export type ProfileRoleUpdateInput = z.infer<typeof profileRoleUpdateSchema>;
