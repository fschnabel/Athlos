import { z } from "zod";

export const institutionFormSchema = z.object({
  name: z.string().trim().min(2, "Institution name is required."),
  type: z.enum(["school", "club", "academy", "university", "federation", "other"]),
  city: z.string().trim().min(2, "City is required."),
  province: z.string().trim().min(2, "Province is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Phone is required."),
  mainContactName: z.string().trim().min(2, "Main contact name is required."),
  logoUrl: z
    .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
});

export type InstitutionFormValues = z.infer<typeof institutionFormSchema>;
