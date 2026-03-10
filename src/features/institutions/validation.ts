import { z } from "zod";

export const institutionProfileSchema = z.object({
  name: z.string().min(2),
  shortName: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  contactEmail: z.string().email(),
});

export type InstitutionProfileFormValues = z.infer<typeof institutionProfileSchema>;
