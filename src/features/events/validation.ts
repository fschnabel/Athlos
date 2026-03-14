import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().trim().min(2, "Event name is required."),
  venue: z.string().trim().min(2, "Venue is required."),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format."),
  durationDays: z.coerce.number().int().min(1, "Duration must be at least 1 day."),
  description: z.string().trim().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export const eventCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required."),
  minAge: z.coerce.number().int().min(4, "Minimum age is required."),
  maxAge: z.coerce.number().int().min(4, "Maximum age is required."),
  disciplines: z.array(z.string()).min(1, "Select at least one discipline."),
});

export type EventCategoryFormValues = z.infer<typeof eventCategorySchema>;

export const invitationEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
});

export type InvitationEmailFormValues = z.infer<typeof invitationEmailSchema>;
