import seedAthletes from "@/mocks/athletes.json";
import { Athlete } from "@/types/domain";
import { PersistedAthleteInput, PersistedAthleteUpdateInput } from "@/types/athletes";

import { AthleteRepository } from "./AthleteRepository";

const seededAthletes = seedAthletes as Athlete[];
let runtimeAthletes = [...seededAthletes];

const cloneAthlete = (athlete: Athlete): Athlete => ({ ...athlete });

const sortAthletes = (athletes: Athlete[]) =>
  [...athletes].sort((left, right) => `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`));

const createAthleteId = (institutionId: string, firstName: string, lastName: string) => {
  const slug = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `ath-${institutionId.replace(/^inst-/, "")}-${slug}-${Date.now().toString(36)}`;
};

export class LocalAthleteRepository implements AthleteRepository {
  async getByInstitutionId(institutionId: string): Promise<Athlete[]> {
    return sortAthletes(runtimeAthletes.filter((athlete) => athlete.institutionId === institutionId)).map(cloneAthlete);
  }

  async getById(id: string): Promise<Athlete | null> {
    const athlete = runtimeAthletes.find((item) => item.id === id);
    return athlete ? cloneAthlete(athlete) : null;
  }

  async create(institutionId: string, data: PersistedAthleteInput): Promise<Athlete> {
    const now = new Date().toISOString();
    const athlete: Athlete = {
      id: createAthleteId(institutionId, data.firstName, data.lastName),
      institutionId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    runtimeAthletes = [athlete, ...runtimeAthletes];
    return cloneAthlete(athlete);
  }

  async update(id: string, data: PersistedAthleteUpdateInput): Promise<Athlete> {
    const index = runtimeAthletes.findIndex((athlete) => athlete.id === id);

    if (index < 0) {
      throw new Error("Athlete not found.");
    }

    const updatedAthlete: Athlete = {
      ...runtimeAthletes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    runtimeAthletes = runtimeAthletes.map((athlete, athleteIndex) => (athleteIndex === index ? updatedAthlete : athlete));

    return cloneAthlete(updatedAthlete);
  }
}

export const localAthleteRepository = new LocalAthleteRepository();
