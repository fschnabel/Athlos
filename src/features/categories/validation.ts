import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1).max(3),
  minAge: z.coerce.number().min(1),
  maxAge: z.coerce.number().min(1),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
