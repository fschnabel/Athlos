export type InstitutionType = "school" | "club" | "academy" | "university" | "federation" | "other";

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  city: string;
  province: string;
  email: string;
  phone: string;
  logoUrl?: string;
  mainContactName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstitutionInput {
  name: string;
  type: InstitutionType;
  city: string;
  province: string;
  email: string;
  phone: string;
  logoUrl?: string;
  mainContactName: string;
}

export type UpdateInstitutionInput = Partial<CreateInstitutionInput>;

export const institutionTypeOptions: Array<{ label: string; value: InstitutionType }> = [
  { label: "School", value: "school" },
  { label: "Club", value: "club" },
  { label: "Academy", value: "academy" },
  { label: "University", value: "university" },
  { label: "Federation", value: "federation" },
  { label: "Other", value: "other" },
];
