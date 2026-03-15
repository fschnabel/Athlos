import { AcceptInvitationRegistrationInput, CompetitionEvent, CreateEventInput, EventInvitationStatus } from "@/types/events";

export interface EventRepository {
  getAll(): Promise<CompetitionEvent[]>;
  getByInstitutionId(institutionId: string): Promise<CompetitionEvent[]>;
  getById(id: string): Promise<CompetitionEvent | null>;
  create(institutionId: string, data: CreateEventInput): Promise<CompetitionEvent>;
  update(eventId: string, data: Partial<CreateEventInput>): Promise<CompetitionEvent>;
  respondToInvitation(eventId: string, invitationId: string, status: EventInvitationStatus): Promise<CompetitionEvent>;
  registerInvitationAthletes(eventId: string, invitationId: string, institutionId: string, registrations: AcceptInvitationRegistrationInput[]): Promise<CompetitionEvent>;
}
