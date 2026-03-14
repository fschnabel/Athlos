import { CreateInstitutionInput, UpdateInstitutionInput } from "@/types/institutions";

import { localInstitutionRepository } from "../repositories/LocalInstitutionRepository";

const repository = localInstitutionRepository;

export const institutionService = {
  getInstitutions: () => repository.getAll(),
  getInstitutionById: (id: string) => repository.getById(id),
  searchInstitutionsByName: (query: string) => repository.searchByName(query),
  createInstitution: (data: CreateInstitutionInput) => repository.create(data),
  updateInstitution: (id: string, data: UpdateInstitutionInput) => repository.update(id, data),
};
