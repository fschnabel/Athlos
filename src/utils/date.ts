export const calculateAge = (birthDate: string, atDate = new Date()) => {
  const birth = new Date(birthDate);
  let age = atDate.getFullYear() - birth.getFullYear();
  const monthDelta = atDate.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && atDate.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};
