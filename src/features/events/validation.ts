import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2),
  venue: z.string().min(2),
  eventDate: z.string().min(10),
  registrationDeadline: z.string().min(10),
  description: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
