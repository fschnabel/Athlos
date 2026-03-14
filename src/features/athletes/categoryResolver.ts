import { mockCategories } from "@/features/mockData";

const getAgeFromBirthDate = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);

  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
};

export const resolveCategoryIdFromBirthDate = (birthDate: string) => {
  const age = getAgeFromBirthDate(birthDate);
  const category = mockCategories.find((item) => age >= item.minAge && age <= item.maxAge);

  return category?.id ?? mockCategories[mockCategories.length - 1]?.id ?? "cat-a";
};

export const getAgeLabelFromBirthDate = (birthDate: string) => `${getAgeFromBirthDate(birthDate)} years`;
