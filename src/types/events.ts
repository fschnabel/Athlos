export type EventStatus = "draft" | "published";
export type InvitationRecipientType = "registered_institution" | "email";

export interface EventInvitation {
  id: string;
  eventId: string;
  recipientType: InvitationRecipientType;
  institutionId?: string;
  institutionName?: string;
  email?: string;
  status: "sent";
  sentAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  disciplines: string[];
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventCategoryInput {
  name: string;
  minAge: number;
  maxAge: number;
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
