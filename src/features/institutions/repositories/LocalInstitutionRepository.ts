import seedInstitutions from "@/mocks/institutions.json";
import { CreateInstitutionInput, Institution, UpdateInstitutionInput } from "@/types/institutions";

import { InstitutionRepository } from "./InstitutionRepository";
import { cloneInstitution, createInstitutionId, normalizeInstitution, sortInstitutionsByName } from "../utils/institutionMappers";

const seededInstitutionData = (seedInstitutions as Institution[]).map(normalizeInstitution);

let runtimeInstitutions = [...seededInstitutionData];

export class LocalInstitutionRepository implements InstitutionRepository {
  async getAll(): Promise<Institution[]> {
    return sortInstitutionsByName(runtimeInstitutions).map(cloneInstitution);
  }

  async getById(id: string): Promise<Institution | null> {
    const institution = runtimeInstitutions.find((item) => item.id === id);
    return institution ? cloneInstitution(institution) : null;
  }

  async create(data: CreateInstitutionInput): Promise<Institution> {
    const now = new Date().toISOString();
    const institution: Institution = normalizeInstitution({
      id: createInstitutionId(data.name),
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    runtimeInstitutions = [institution, ...runtimeInstitutions];
    return cloneInstitution(institution);
  }

  async update(id: string, data: UpdateInstitutionInput): Promise<Institution> {
    const index = runtimeInstitutions.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error("Institution not found.");
    }

    const currentInstitution = runtimeInstitutions[index];
    const updatedInstitution: Institution = normalizeInstitution({
      ...currentInstitution,
      ...data,
      updatedAt: new Date().toISOString(),
    });

    runtimeInstitutions = runtimeInstitutions.map((item, itemIndex) => (itemIndex === index ? updatedInstitution : item));

    return cloneInstitution(updatedInstitution);
  }

  async searchByName(query: string): Promise<Institution[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.getAll();
    }

    return sortInstitutionsByName(
      runtimeInstitutions.filter((institution) => institution.name.toLowerCase().includes(normalizedQuery)),
    ).map(cloneInstitution);
  }
}

export const localInstitutionRepository = new LocalInstitutionRepository();
