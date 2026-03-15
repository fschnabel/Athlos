import { institutionService } from "@/features/institutions/services/institutionService";
import { CheckinStatus } from "@/types/domain";
import { CompetitionEvent } from "@/types/events";

import { getEventById, listEventsByInstitution } from "../events/service";

interface CheckinRegistrationSummary {
  athleteId: string;
  athleteName: string;
  institutionId: string;
  institutionName: string;
  registrationIds: string[];
  categoryNames: string[];
  disciplines: string[];
  status: CheckinStatus;
}

interface CheckinInstitutionSummary {
  institutionId: string;
  institutionName: string;
  athleteCount: number;
}

interface CheckinEventSummary {
  eventId: string;
  eventName: string;
  startDate: string;
  startTime: string;
  venue: string;
  institutionCount: number;
}

const runtimeCheckinStatus = new Map<string, CheckinStatus>();

const createStatusKey = (eventId: string, registrationId: string) => `${eventId}:${registrationId}`;

const getRegistrationStatus = (eventId: string, registrationId: string): CheckinStatus => runtimeCheckinStatus.get(createStatusKey(eventId, registrationId)) ?? "registered";

const getAthleteStatus = (eventId: string, registrationIds: string[]): CheckinStatus => {
  const statuses = registrationIds.map((registrationId) => getRegistrationStatus(eventId, registrationId));

  if (statuses.every((status) => status === "present")) {
    return "present";
  }

  if (statuses.some((status) => status === "present")) {
    return "assigned";
  }

  return "registered";
};

const dedupe = (values: string[]) => Array.from(new Set(values));

const getInstitutionNameMap = async (event: CompetitionEvent) => {
  const institutionIds = dedupe(event.registrations.map((registration) => registration.institutionId));
  const institutions = await Promise.all(institutionIds.map((institutionId) => institutionService.getInstitutionById(institutionId)));

  return new Map(institutions.filter(Boolean).map((institution) => [institution!.id, institution!.name]));
};

export const listCheckinEventsByInstitution = async (institutionId: string): Promise<CheckinEventSummary[]> => {
  const events = await listEventsByInstitution(institutionId);

  return events
    .map((event) => ({
      eventId: event.id,
      eventName: event.name,
      startDate: event.startDate,
      startTime: event.startTime,
      venue: event.venue,
      institutionCount: dedupe(event.registrations.map((registration) => registration.institutionId)).length,
    }))
    .sort((left, right) => `${right.startDate}${right.startTime}`.localeCompare(`${left.startDate}${left.startTime}`));
};

export const listCheckinInstitutionsForEvent = async (eventId: string): Promise<CheckinInstitutionSummary[]> => {
  const event = await getEventById(eventId);

  if (!event) {
    return [];
  }

  const institutionNames = await getInstitutionNameMap(event);
  const grouped = new Map<string, Set<string>>();

  event.registrations.forEach((registration) => {
    const current = grouped.get(registration.institutionId) ?? new Set<string>();
    current.add(registration.athleteId);
    grouped.set(registration.institutionId, current);
  });

  return Array.from(grouped.entries())
    .map(([institutionId, athleteIds]) => ({
      institutionId,
      institutionName: institutionNames.get(institutionId) ?? institutionId,
      athleteCount: athleteIds.size,
    }))
    .sort((left, right) => left.institutionName.localeCompare(right.institutionName));
};

export const listCheckinAthletesForInstitution = async (eventId: string, institutionId: string): Promise<CheckinRegistrationSummary[]> => {
  const event = await getEventById(eventId);

  if (!event) {
    return [];
  }

  const institution = await institutionService.getInstitutionById(institutionId);
  const grouped = new Map<string, CheckinRegistrationSummary>();

  event.registrations
    .filter((registration) => registration.institutionId === institutionId)
    .forEach((registration) => {
      const current = grouped.get(registration.athleteId);

      if (current) {
        current.registrationIds.push(registration.id);
        current.categoryNames.push(registration.categoryName);
        current.disciplines.push(registration.discipline);
        current.status = getAthleteStatus(event.id, current.registrationIds);
        return;
      }

      grouped.set(registration.athleteId, {
        athleteId: registration.athleteId,
        athleteName: registration.athleteName,
        institutionId,
        institutionName: institution?.name ?? institutionId,
        registrationIds: [registration.id],
        categoryNames: [registration.categoryName],
        disciplines: [registration.discipline],
        status: getAthleteStatus(event.id, [registration.id]),
      });
    });

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      categoryNames: dedupe(item.categoryNames),
      disciplines: dedupe(item.disciplines),
      status: getAthleteStatus(event.id, item.registrationIds),
    }))
    .sort((left, right) => left.athleteName.localeCompare(right.athleteName));
};

export const enableAthletesForCompetition = async (eventId: string, institutionId: string, athleteIds: string[]) => {
  const athletes = await listCheckinAthletesForInstitution(eventId, institutionId);

  athletes
    .filter((athlete) => athleteIds.includes(athlete.athleteId))
    .forEach((athlete) => {
      athlete.registrationIds.forEach((registrationId) => {
        runtimeCheckinStatus.set(createStatusKey(eventId, registrationId), "present");
      });
    });

  return listCheckinAthletesForInstitution(eventId, institutionId);
};
