import { z } from "zod";

export const athleteSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  gender: z.enum(["male", "female", "other"]),
  birthDate: z.string().min(10),
  categoryId: z.string().min(1),
});

export type AthleteFormValues = z.infer<typeof athleteSchema>;
