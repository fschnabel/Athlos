export interface CreateAthleteInput {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  birthDate: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PersistedAthleteInput extends CreateAthleteInput {
  categoryId: string;
}

export type UpdateAthleteInput = Partial<CreateAthleteInput>;
export type PersistedAthleteUpdateInput = Partial<PersistedAthleteInput>;
