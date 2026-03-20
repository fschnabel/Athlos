export type EventStatus = "draft" | "published" | "in_progress" | "completed";
export type InvitationRecipientType = "registered_institution" | "email";
export type EventInvitationStatus = "sent" | "accepted" | "rejected";
export type EventAthleteRegistrationStatus = "registered";
export type EventCategoryGender = "male" | "female" | "mixed";

export interface EventInvitation {
  id: string;
  eventId: string;
  recipientType: InvitationRecipientType;
  institutionId?: string;
  institutionName?: string;
  email?: string;
  status: EventInvitationStatus;
  sentAt: string;
  respondedAt?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  gender: EventCategoryGender;
  disciplines: string[];
}

export interface EventAthleteRegistration {
  id: string;
  eventId: string;
  invitationId: string;
  institutionId: string;
  athleteId: string;
  athleteName: string;
  categoryId: string;
  categoryName: string;
  discipline: string;
  status: EventAthleteRegistrationStatus;
  createdAt: string;
}

export interface EventHeat {
  id: string;
  eventId: string;
  categoryId: string;
  categoryName: string;
  discipline: string;
  name: string;
  order: number;
}

export interface EventHeatAssignment {
  id: string;
  eventId: string;
  heatId: string;
  registrationId: string;
  athleteId: string;
  athleteName: string;
  institutionId: string;
  categoryId: string;
  discipline: string;
  position: number;
}

export interface CompetitionEvent {
  id: string;
  institutionId: string;
  name: string;
  venue: string;
  startDate: string;
  startTime: string;
  durationDays: number;
  description?: string;
  status: EventStatus;
  categories: EventCategory[];
  invitations: EventInvitation[];
  registrations: EventAthleteRegistration[];
  heats: EventHeat[];
  heatAssignments: EventHeatAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventCategoryInput {
  name: string;
  minAge: number;
  maxAge: number;
  gender: EventCategoryGender;
  disciplines: string[];
}

export interface CreateEventInvitationInput {
  recipientType: InvitationRecipientType;
  institutionId?: string;
  institutionName?: string;
  email?: string;
}

export interface CreateEventInput {
  name: string;
  venue: string;
  startDate: string;
  startTime: string;
  durationDays: number;
  description?: string;
  categories: CreateEventCategoryInput[];
  invitations: CreateEventInvitationInput[];
}

export interface AcceptInvitationRegistrationInput {
  athleteId: string;
  athleteName?: string;
  categoryId: string;
  discipline: string;
}
