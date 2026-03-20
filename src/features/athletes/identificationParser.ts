export interface IdentificationScanData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: "male" | "female";
  rawValue: string;
}

const FIELD_LABELS = [
  "APELLIDOS Y NOMBRES",
  "APELLIDOS YNOMBRES",
  "APELLIDOS",
  "NOMBRES",
  "SEXO",
  "SEX",
  "FECHA DE NACIMIENTO",
  "FECHANACIMIENTO",
  "F. NACIMIENTO",
  "F NACIMIENTO",
  "FNACIMIENTO",
  "NUMERO DE DOCUMENTO",
  "LUGAR DE NACIMIENTO",
  "NACIONALIDAD",
  "ESTADO CIVIL",
  "INSTRUCCION",
  "PROFESION",
  "OCUPACION",
  "LUGAR Y FECHA DE EXPEDICION",
  "FECHA DE EXPIRACION",
  "CODIGO DACTILAR",
  "REPUBLICA DEL ECUADOR",
  "DIRECCION GENERAL",
  "REGISTRO CIVIL",
  "IDENTIFICACION Y CEDULACION",
  "CEDULA DE",
  "CIUDADANIA",
];

const LABEL_FRAGMENTS = [
  "APELLID",
  "YNOMBRE",
  "NOMBR",
  "SEXO",
  "SEX",
  "FECHA",
  "NACIM",
  "DOCUMENT",
  "CEDUL",
  "REGISTRO",
  "REPUBLICA",
  "ECUADOR",
  "NACIONAL",
  "EXPIR",
  "EXPEDIC",
  "DACTIL",
  "CIUDADAN",
  "DIRECCION",
  "GENERAL",
];

const SPANISH_MONTHS: Record<string, string> = {
  ENE: "01",
  FEB: "02",
  MAR: "03",
  ABR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AGO: "08",
  SEP: "09",
  SET: "09",
  OCT: "10",
  NOV: "11",
  DIC: "12",
};

const normalizeDate = (value: string) => {
  const normalizedSource = sanitizeUpperLine(value);
  const monthNameMatch = normalizedSource.match(/(?:^|\s)(\d{1,2})\s+([A-ZÁÉÍÓÚÑ]{3,})\s+(\d{4})(?:\s|$)/);

  if (monthNameMatch) {
    const [, rawDay, rawMonth, year] = monthNameMatch;
    const monthKey = rawMonth
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .slice(0, 3);
    const month = SPANISH_MONTHS[monthKey];

    if (month) {
      const day = rawDay.padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  const cleaned = value.replace(/[^0-9/\-]/g, "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const isoSlashMatch = cleaned.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (isoSlashMatch) {
    const [, year, month, day] = isoSlashMatch;
    return `${year}-${month}-${day}`;
  }

  const slashMatch = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  const dashMatch = cleaned.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashMatch) {
    const [, day, month, year] = dashMatch;
    return `${year}-${month}-${day}`;
  }

  return undefined;
};

const extractDateMatches = (value: string) => {
  const matches =
    value.match(/\b\d{4}[\/\-]\d{2}[\/\-]\d{2}\b|\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b|\d{1,2}\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]{3,}\s+\d{4}/g) ?? [];
  return matches
    .map((match) => normalizeDate(match))
    .filter((match): match is string => Boolean(match));
};

const selectLikelyBirthDate = (candidates: string[]) => {
  const currentYear = new Date().getFullYear();

  const validDates = candidates
    .map((candidate) => {
      const date = new Date(`${candidate}T00:00:00`);
      return Number.isNaN(date.getTime()) ? null : { candidate, date };
    })
    .filter((item): item is { candidate: string; date: Date } => Boolean(item))
    .filter(({ date }) => {
      const year = date.getFullYear();
      return year >= 1940 && year <= currentYear;
    })
    .sort((left, right) => left.date.getTime() - right.date.getTime());

  return validDates[0]?.candidate;
};

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const sanitizeNameLine = (value: string) =>
  value
    .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeUpperLine = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÑ0-9/\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasLabelFragments = (value: string) => {
  const upper = sanitizeUpperLine(value);
  return LABEL_FRAGMENTS.some((fragment) => upper.includes(fragment));
};

const isLikelyLabelLine = (value: string) => {
  const upper = sanitizeUpperLine(value);
  return FIELD_LABELS.some((label) => upper.includes(label)) || LABEL_FRAGMENTS.some((fragment) => upper.includes(fragment));
};

const isLikelyNameCandidate = (value: string) => {
  const cleaned = sanitizeNameLine(value);

  if (!cleaned || cleaned.length < 3) {
    return false;
  }

  if (hasLabelFragments(cleaned)) {
    return false;
  }

  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length < 1 || parts.length > 4) {
    return false;
  }

  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(cleaned);
};

const findFieldIndex = (lines: string[], labels: string[]) =>
  lines.findIndex((line) => labels.some((label) => sanitizeUpperLine(line).includes(label)));

const findNextContentLine = (lines: string[], startIndex: number) => {
  for (let nextIndex = startIndex + 1; nextIndex < lines.length; nextIndex += 1) {
    const nextLine = lines[nextIndex].trim();

    if (!nextLine) {
      continue;
    }

    if (isLikelyLabelLine(nextLine)) {
      break;
    }

    return nextLine;
  }

  return undefined;
};

const findNextNameCandidate = (lines: string[], startIndex: number) => {
  for (let nextIndex = startIndex + 1; nextIndex < lines.length; nextIndex += 1) {
    const nextLine = lines[nextIndex].trim();

    if (!nextLine) {
      continue;
    }

    if (isLikelyLabelLine(nextLine)) {
      continue;
    }

    if (!isLikelyNameCandidate(nextLine)) {
      continue;
    }

    return { value: nextLine, index: nextIndex };
  }

  return undefined;
};

const extractFieldValue = (lines: string[], labels: string[]) => {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const normalizedLine = sanitizeUpperLine(line);
    const match = labels.find((label) => normalizedLine.includes(label));

    if (!match) {
      continue;
    }

    const inlineValue = normalizedLine
      .replace(match, "")
      .replace(/^[:\-\s]+/, "")
      .trim();

    if (inlineValue && inlineValue !== normalizedLine) {
      return inlineValue;
    }

    const nextLine = findNextContentLine(lines, index);
    if (nextLine) {
      return nextLine;
    }
  }

  return undefined;
};

const extractFieldCandidateBlock = (lines: string[], labels: string[], maxLines = 3) => {
  for (let index = 0; index < lines.length; index += 1) {
    const normalizedLine = sanitizeUpperLine(lines[index]);
    const match = labels.find((label) => normalizedLine.includes(label));

    if (!match) {
      continue;
    }

    const collected: string[] = [];
    const inlineValue = normalizedLine
      .replace(match, "")
      .replace(/^[:\-\s]+/, "")
      .trim();

    if (inlineValue && inlineValue !== normalizedLine) {
      collected.push(inlineValue);
    }

    for (let nextIndex = index + 1; nextIndex < lines.length && collected.length < maxLines; nextIndex += 1) {
      const nextLine = lines[nextIndex].trim();

      if (!nextLine) {
        continue;
      }

      if (isLikelyLabelLine(nextLine)) {
        break;
      }

      collected.push(nextLine);
    }

    return collected;
  }

  return [];
};

const pickBestNameFromBlock = (block: string[]) => {
  const candidates = block
    .map((line) => sanitizeNameLine(line))
    .filter((line) => isLikelyNameCandidate(line))
    .filter((line) => !/\b(ECUADOR|CONDUCIR|LICENCIA|DRIVER|MOTORISTA|FUHRERSCHEIN|NACIONALIDAD|DOB)\b/i.test(line))
    .filter((line) => !/^(NAME|INAME|NAMES|FAMILY|SURNAME|SURNAMES|LAST NAME|NOMBRE|NOMBRES|APELLIDO|APELLIDOS)$/i.test(line))
    .filter((line) => line.length >= 5);

  return candidates
    .sort((left, right) => right.split(" ").length - left.split(" ").length || right.length - left.length)
    .at(0);
};

const findBestTrailingNameCandidate = (lines: string[], startIndex: number, maxDistance = 6) => {
  const collected: string[] = [];

  for (let nextIndex = startIndex + 1; nextIndex < lines.length && nextIndex <= startIndex + maxDistance; nextIndex += 1) {
    const nextLine = lines[nextIndex].trim();

    if (!nextLine) {
      continue;
    }

    collected.push(nextLine);
  }

  return pickBestNameFromBlock(collected);
};

const splitEcuadorianFullName = (value: string) => {
  const cleaned = sanitizeNameLine(value);
  const parts = cleaned.split(" ").filter(Boolean);

  if (parts.length >= 4) {
    return {
      lastName: toTitleCase(parts.slice(0, 2).join(" ")),
      firstName: toTitleCase(parts.slice(2).join(" ")),
    };
  }

  if (parts.length === 3) {
    return {
      lastName: toTitleCase(parts.slice(0, 1).join(" ")),
      firstName: toTitleCase(parts.slice(1).join(" ")),
    };
  }

  if (parts.length === 2) {
    return {
      lastName: toTitleCase(parts[0]),
      firstName: toTitleCase(parts[1]),
    };
  }

  return {
    lastName: cleaned ? toTitleCase(cleaned) : undefined,
    firstName: undefined,
  };
};

const resolveGender = (source: string) => {
  const value = sanitizeUpperLine(source);

  if (/\b(F|FEMENINO|FEMALE|MUJER)\b/.test(value)) {
    return "female" as const;
  }

  if (/\b(M|MASCULINO|MALE|HOMBRE|SEXOHOMBRE)\b/.test(value)) {
    return "male" as const;
  }

  return undefined;
};

export const parseIdentificationScan = (rawValue: string): IdentificationScanData => {
  const compact = rawValue.replace(/\r/g, "\n");
  const lines = compact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const upperRaw = sanitizeUpperLine(compact.replace(/\n/g, " "));

  const fullNameLabelIndex = findFieldIndex(lines, ["APELLIDOS Y NOMBRES", "APELLIDOS YNOMBRES"]);
  const surnameCandidate = fullNameLabelIndex >= 0 ? findNextNameCandidate(lines, fullNameLabelIndex) : undefined;
  const nameCandidate = surnameCandidate ? findNextNameCandidate(lines, surnameCandidate.index) : undefined;

  const birthDateLabels = ["FECHA DE NACIMIENTO", "FECHANACIMIENTO", "F. NACIMIENTO", "F NACIMIENTO", "FNACIMIENTO"];
  const birthDateField = extractFieldValue(lines, birthDateLabels);
  const birthDateFieldBlock = extractFieldCandidateBlock(lines, birthDateLabels, 3);
  const genderLabels = ["SEXO", "SEX"];
  const genderField = extractFieldValue(lines, genderLabels);
  const genderFieldBlock = extractFieldCandidateBlock(lines, genderLabels, 2);

  let firstName: string | undefined;
  let lastName: string | undefined;

  if (surnameCandidate && nameCandidate) {
    lastName = toTitleCase(sanitizeNameLine(surnameCandidate.value));
    firstName = toTitleCase(sanitizeNameLine(nameCandidate.value));
  } else {
    const fullNameField = extractFieldValue(lines, ["APELLIDOS Y NOMBRES", "APELLIDOS YNOMBRES"]);
    if (fullNameField && isLikelyNameCandidate(fullNameField)) {
      const parsed = splitEcuadorianFullName(fullNameField);
      firstName = parsed.firstName;
      lastName = parsed.lastName;
    }
  }

  const surnameLabels = ["APELLIDOS", "APELLIDO", "SURNAME", "SURNAMES", "LAST NAME", "FAMILY NAME", "APELLIDO FAMILY"];
  const nameLabels = ["NOMBRES", "NOMBRE", "NAMES", "NOMBRE NAME"];
  const surnameField = fullNameLabelIndex >= 0 ? undefined : extractFieldValue(lines, surnameLabels);
  const surnameFieldBlock = fullNameLabelIndex >= 0 ? [] : extractFieldCandidateBlock(lines, surnameLabels, 3);
  const nameLabelIndex = fullNameLabelIndex >= 0 ? -1 : findFieldIndex(lines, nameLabels);
  const nameField = fullNameLabelIndex >= 0 ? undefined : extractFieldValue(lines, nameLabels);
  const nameFieldBlock = fullNameLabelIndex >= 0 ? [] : extractFieldCandidateBlock(lines, nameLabels, 4);
  const trailingNameCandidate = nameLabelIndex >= 0 ? findBestTrailingNameCandidate(lines, nameLabelIndex, 6) : undefined;
  const bestSurnameField = pickBestNameFromBlock([surnameField ?? "", ...surnameFieldBlock].filter(Boolean));
  const bestNameField = pickBestNameFromBlock([trailingNameCandidate ?? "", nameField ?? "", ...nameFieldBlock].filter(Boolean));

  if (!lastName && bestSurnameField && isLikelyNameCandidate(bestSurnameField)) {
    lastName = toTitleCase(sanitizeNameLine(bestSurnameField));
  }

  if (!firstName && bestNameField && isLikelyNameCandidate(bestNameField)) {
    firstName = toTitleCase(sanitizeNameLine(bestNameField));
  }

  const birthDateCandidates = [
    ...birthDateFieldBlock.flatMap((line) => extractDateMatches(line)),
    ...extractDateMatches(birthDateField ?? ""),
    ...extractDateMatches(compact),
  ];
  const birthDate = selectLikelyBirthDate(birthDateCandidates);
  const gender = resolveGender([genderField ?? "", ...genderFieldBlock, upperRaw].filter(Boolean).join(" "));

  if (!firstName || !lastName) {
    const alphabeticLines = lines
      .map((line) => sanitizeNameLine(line))
      .filter((line) => line.split(" ").length >= 2 && line.length >= 5)
      .filter((line) => !isLikelyLabelLine(line))
      .filter((line) => isLikelyNameCandidate(line));

    const strongestPair = alphabeticLines.find((line) => line.split(" ").length >= 3);
    const bestCandidate = strongestPair ?? alphabeticLines.find((line) => line === line.toUpperCase()) ?? alphabeticLines[0];

    if (bestCandidate) {
      const parsed = splitEcuadorianFullName(bestCandidate);
      firstName = firstName ?? parsed.firstName;
      lastName = lastName ?? parsed.lastName;
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













