import { institutionService } from "@/features/institutions/services/institutionService";
import { listAthletesByInstitution } from "@/features/athletes/service";
import { AcceptInvitationRegistrationInput, CompetitionEvent, CreateEventInput, CreateEventInvitationInput } from "@/types/events";

import { localEventRepository } from "./repositories/LocalEventRepository";

const repository = localEventRepository;

export const listAllEvents = (): Promise<CompetitionEvent[]> => repository.getAll();
export const listEventsByInstitution = (institutionId: string): Promise<CompetitionEvent[]> => repository.getByInstitutionId(institutionId);
export const getEventById = (eventId: string): Promise<CompetitionEvent | null> => repository.getById(eventId);
export const createEvent = (institutionId: string, data: CreateEventInput): Promise<CompetitionEvent> => repository.create(institutionId, data);
export const updateEvent = (eventId: string, data: Partial<CreateEventInput>): Promise<CompetitionEvent> => repository.update(eventId, data);
export const startEvent = (eventId: string): Promise<CompetitionEvent> => repository.startEvent(eventId);

export const listReceivedInvitationsByInstitution = async (institutionId: string) => {
  const events = await repository.getAll();

  return events
    .flatMap((event) =>
      event.invitations
        .filter((invitation) => invitation.recipientType === "registered_institution" && invitation.institutionId === institutionId)
        .map((invitation) => ({ event, invitation })),
    )
    .sort((left, right) => right.event.startDate.localeCompare(left.event.startDate));
};

export const acceptInvitationWithAthletes = async (
  eventId: string,
  invitationId: string,
  institutionId: string,
  selections: AcceptInvitationRegistrationInput[],
): Promise<CompetitionEvent> => {
  const athletes = await listAthletesByInstitution(institutionId);
  const normalizedSelections = selections.map((selection) => {
    const athlete = athletes.find((item) => item.id === selection.athleteId);

    return {
      ...selection,
      athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : selection.athleteId,
    };
  });

  return repository.registerInvitationAthletes(eventId, invitationId, institutionId, normalizedSelections);
};

export const rejectInvitation = (eventId: string, invitationId: string): Promise<CompetitionEvent> =>
  repository.respondToInvitation(eventId, invitationId, "rejected");

export const buildRegisteredInstitutionInvitation = async (institutionId: string): Promise<CreateEventInvitationInput | null> => {
  const institution = await institutionService.getInstitutionById(institutionId);

  if (!institution) {
    return null;
  }

  return {
    recipientType: "registered_institution",
    institutionId: institution.id,
    institutionName: institution.name,
  };
};

export const buildEmailInvitation = (email: string): CreateEventInvitationInput => ({
  recipientType: "email",
  email,
});
