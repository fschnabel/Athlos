import { CreateInstitutionInput, Institution, UpdateInstitutionInput } from "@/types/institutions";

export interface InstitutionRepository {
  getAll(): Promise<Institution[]>;
  getById(id: string): Promise<Institution | null>;
  create(data: CreateInstitutionInput): Promise<Institution>;
  update(id: string, data: UpdateInstitutionInput): Promise<Institution>;
  searchByName(query: string): Promise<Institution[]>;
}
