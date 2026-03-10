import { z } from "zod";

export const coachSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export type CoachFormValues = z.infer<typeof coachSchema>;
