import {
  Athlete,
  Category,
  Checkin,
  Coach,
  Event,
  EventDiscipline,
  EventRegistration,
  Institution,
  Invitation,
} from "@/types/domain";

export const mockInstitution: Institution = {
  id: "inst-1",
  name: "Athlos Academy",
  shortName: "ATH",
  type: "academy",
  city: "Quito",
  country: "Ecuador",
  contactEmail: "admin@athlos.app",
};

export const mockCoaches: Coach[] = [
  { id: "coach-1", institutionId: "inst-1", firstName: "Laura", lastName: "Mena", email: "laura@athlos.app" },
  { id: "coach-2", institutionId: "inst-1", firstName: "Diego", lastName: "Soto", email: "diego@athlos.app" },
];

export const mockCategories: Category[] = [
  { id: "cat-d", name: "Category D", minAge: 6, maxAge: 8, code: "D" },
  { id: "cat-c", name: "Category C", minAge: 8, maxAge: 10, code: "C" },
  { id: "cat-b", name: "Category B", minAge: 11, maxAge: 12, code: "B" },
  { id: "cat-a", name: "Category A", minAge: 13, maxAge: 14, code: "A" },
];

export const mockAthletes: Athlete[] = [
  {
    id: "ath-1",
    institutionId: "inst-1",
    firstName: "Mateo",
    lastName: "Diaz",
    gender: "male",
    birthDate: "2013-07-18",
    categoryId: "cat-a",
  },
  {
    id: "ath-2",
    institutionId: "inst-1",
    firstName: "Sara",
    lastName: "Lopez",
    gender: "female",
    birthDate: "2014-01-05",
    categoryId: "cat-a",
  },
];

export const mockEvents: Event[] = [
  {
    id: "event-1",
    institutionId: "inst-1",
    name: "Inter-Schools Sprint Meet",
    venue: "Athlos Stadium",
    eventDate: "2026-05-20",
    registrationDeadline: "2026-05-10",
    status: "published",
    description: "Track and field invitational for youth categories.",
  },
];

export const mockInvitations: Invitation[] = [
  {
    id: "inv-1",
    eventId: "event-1",
    fromInstitutionId: "inst-1",
    toInstitutionId: "inst-2",
    status: "pending",
  },
  {
    id: "inv-2",
    eventId: "event-1",
    fromInstitutionId: "inst-3",
    toInstitutionId: "inst-1",
    status: "accepted",
  },
];

export const mockEventDisciplines: EventDiscipline[] = [
  {
    id: "ed-1",
    eventId: "event-1",
    name: "100 meters",
    disciplineType: "track_lanes",
    usesLanes: true,
    usesHeats: true,
    usesStartOrder: false,
    maxParticipantsPerHeat: 8,
    categoryId: "cat-a",
    isOpen: true,
  },
];

export const mockRegistrations: EventRegistration[] = [
  {
    id: "reg-1",
    eventId: "event-1",
    eventDisciplineId: "ed-1",
    institutionId: "inst-1",
    athleteId: "ath-1",
    categoryId: "cat-a",
  },
  {
    id: "reg-2",
    eventId: "event-1",
    eventDisciplineId: "ed-1",
    institutionId: "inst-1",
    athleteId: "ath-2",
    categoryId: "cat-a",
  },
];

export const mockCheckins: Checkin[] = [
  { id: "check-1", eventId: "event-1", eventDisciplineId: "ed-1", registrationId: "reg-1", athleteId: "ath-1", status: "present" },
  { id: "check-2", eventId: "event-1", eventDisciplineId: "ed-1", registrationId: "reg-2", athleteId: "ath-2", status: "registered" },
];
