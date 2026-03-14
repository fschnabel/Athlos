import { institutionService } from "@/features/institutions/services/institutionService";
import { CompetitionEvent, CreateEventInput, CreateEventInvitationInput } from "@/types/events";

import { localEventRepository } from "./repositories/LocalEventRepository";

const repository = localEventRepository;

export const listEventsByInstitution = (institutionId: string): Promise<CompetitionEvent[]> => repository.getByInstitutionId(institutionId);
export const getEventById = (eventId: string): Promise<CompetitionEvent | null> => repository.getById(eventId);
export const createEvent = (institutionId: string, data: CreateEventInput): Promise<CompetitionEvent> => repository.create(institutionId, data);
export const updateEvent = (eventId: string, data: Partial<CreateEventInput>): Promise<CompetitionEvent> => repository.update(eventId, data);

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
