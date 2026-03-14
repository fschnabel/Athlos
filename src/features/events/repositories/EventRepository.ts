import { CreateEventInput, CompetitionEvent } from "@/types/events";

export interface EventRepository {
  getByInstitutionId(institutionId: string): Promise<CompetitionEvent[]>;
  getById(id: string): Promise<CompetitionEvent | null>;
  create(institutionId: string, data: CreateEventInput): Promise<CompetitionEvent>;
  update(eventId: string, data: Partial<CreateEventInput>): Promise<CompetitionEvent>;
}
