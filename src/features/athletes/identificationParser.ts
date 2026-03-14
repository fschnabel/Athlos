export interface IdentificationScanData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: "male" | "female";
  rawValue: string;
}

const normalizeDate = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const slashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  return undefined;
};

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const parseIdentificationScan = (rawValue: string): IdentificationScanData => {
  const compact = rawValue.replace(/\r/g, "\n");
  const lines = compact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const dateCandidate = compact.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{2}\/\d{2}\/\d{4}\b/);
  const birthDate = dateCandidate ? normalizeDate(dateCandidate[0]) : undefined;

  const upperRaw = compact.toUpperCase();
  let gender: IdentificationScanData["gender"];
  if (/\b(F|FEMALE|MUJER)\b/.test(upperRaw)) {
    gender = "female";
  } else if (/\b(M|MALE|HOMBRE)\b/.test(upperRaw)) {
    gender = "male";
  }

  const labeledName = upperRaw.match(/(?:NOMBRES?|NAMES?)[:\s]+([A-ZÁÉÍÓÚÑ ]{3,})/);
  const labeledSurname = upperRaw.match(/(?:APELLIDOS?|SURNAMES?|LAST NAME)[:\s]+([A-ZÁÉÍÓÚÑ ]{3,})/);

  let firstName = labeledName ? toTitleCase(labeledName[1]) : undefined;
  let lastName = labeledSurname ? toTitleCase(labeledSurname[1]) : undefined;

  if (!firstName || !lastName) {
    const alphabeticLines = lines
      .map((line) => line.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, " ").replace(/\s+/g, " ").trim())
      .filter((line) => line.split(" ").length >= 2 && line.length >= 5);

    const bestCandidate = alphabeticLines.find((line) => line === line.toUpperCase()) ?? alphabeticLines[0];

    if (bestCandidate) {
      const parts = bestCandidate.split(" ").filter(Boolean);
      if (parts.length >= 4) {
        lastName = lastName ?? toTitleCase(parts.slice(0, 2).join(" "));
        firstName = firstName ?? toTitleCase(parts.slice(2).join(" "));
      } else if (parts.length >= 2) {
        firstName = firstName ?? toTitleCase(parts[0]);
        lastName = lastName ?? toTitleCase(parts.slice(1).join(" "));
      }
    }
  }

  return {
    firstName,
    lastName,
    birthDate,
    gender,
    rawValue,
  };
};
