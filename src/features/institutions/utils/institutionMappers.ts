import { Institution } from "@/types/institutions";

export const cloneInstitution = (institution: Institution): Institution => ({ ...institution });

export const normalizeInstitution = (institution: Institution): Institution => ({
  ...institution,
  logoUrl: institution.logoUrl?.trim() || undefined,
});

export const sortInstitutionsByName = (institutions: Institution[]) =>
  [...institutions].sort((left, right) => left.name.localeCompare(right.name));

export const createInstitutionId = (name: string) =>
  `inst-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
