import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const institutionRegistrationSchema = z.object({
  institutionName: z.string().min(2),
  shortName: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  contactEmail: z.string().email(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  password: z.string().min(6),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type InstitutionRegistrationFormValues = z.infer<typeof institutionRegistrationSchema>;
