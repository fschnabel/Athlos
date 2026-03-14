import { Athlete } from "@/types/domain";
import { CreateAthleteInput, UpdateAthleteInput } from "@/types/athletes";

import { localAthleteRepository } from "./repositories/LocalAthleteRepository";
import { resolveCategoryIdFromBirthDate } from "./categoryResolver";

const repository = localAthleteRepository;

export const listAthletesByInstitution = (institutionId: string): Promise<Athlete[]> => repository.getByInstitutionId(institutionId);
export const getAthleteById = (id: string): Promise<Athlete | null> => repository.getById(id);
export const createAthlete = (institutionId: string, data: CreateAthleteInput): Promise<Athlete> =>
  repository.create(institutionId, {
    ...data,
    categoryId: resolveCategoryIdFromBirthDate(data.birthDate),
  });
export const updateAthlete = async (id: string, data: UpdateAthleteInput): Promise<Athlete> => {
  const currentAthlete = await repository.getById(id);

  if (!currentAthlete) {
    throw new Error("Athlete not found.");
  }

  const nextBirthDate = data.birthDate ?? currentAthlete.birthDate;

  return repository.update(id, {
    ...data,
    categoryId: resolveCategoryIdFromBirthDate(nextBirthDate),
  });
};
