import { Category } from "@/types/domain";
import { calculateAge } from "@/utils/date";

export const isAthleteEligibleForCategory = (
  birthDate: string,
  category: Category,
  atDate?: Date,
) => {
  const age = calculateAge(birthDate, atDate);
  return age >= category.minAge && age <= category.maxAge;
};
