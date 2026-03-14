import { Athlete } from "@/types/domain";
import { PersistedAthleteInput, PersistedAthleteUpdateInput } from "@/types/athletes";

export interface AthleteRepository {
  getByInstitutionId(institutionId: string): Promise<Athlete[]>;
  getById(id: string): Promise<Athlete | null>;
  create(institutionId: string, data: PersistedAthleteInput): Promise<Athlete>;
  update(id: string, data: PersistedAthleteUpdateInput): Promise<Athlete>;
}
