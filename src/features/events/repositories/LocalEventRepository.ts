import AsyncStorage from "@react-native-async-storage/async-storage";

import seedEvents from "@/mocks/events.json";
import { AcceptInvitationRegistrationInput, CompetitionEvent, CreateEventCategoryInput, CreateEventInput, CreateEventInvitationInput, EventInvitationStatus } from "@/types/events";

import { EventRepository } from "./EventRepository";

const STORAGE_KEY = "athlos.events.runtime";
const rawSeedEvents = Array.isArray(seedEvents) ? seedEvents : [seedEvents];
const seededEvents = ((rawSeedEvents as unknown) as CompetitionEvent[]).map((event) => ({
  ...event,
  registrations: event.registrations ?? [],
}));

let runtimeEvents = [...seededEvents];
let hydrated = false;

const cloneEvent = (event: CompetitionEvent): CompetitionEvent => ({
  ...event,
  categories: event.categories.map((category) => ({ ...category, disciplines: [...category.disciplines] })),
  invitations: event.invitations.map((invitation) => ({ ...invitation })),
  registrations: event.registrations.map((registration) => ({ ...registration })),
});

const sortEvents = (events: CompetitionEvent[]) => [...events].sort((left, right) => `${right.startDate} ${right.startTime}`.localeCompare(`${left.startDate} ${left.startTime}`));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createCategory = (eventId: string, input: CreateEventCategoryInput) => ({
  id: `event-category-${slugify(input.name)}-${Date.now().toString(36)}`,
  name: input.name,
  minAge: input.minAge,
  maxAge: input.maxAge,
  gender: input.gender,
  disciplines: [...input.disciplines],
});

const createInvitation = (eventId: string, input: CreateEventInvitationInput) => ({
  id: `event-invitation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  eventId,
  recipientType: input.recipientType,
  institutionId: input.institutionId,
  institutionName: input.institutionName,
  email: input.email,
  status: "sent" as const,
  sentAt: new Date().toISOString(),
});

const mergeInvitation = (eventId: string, input: CreateEventInvitationInput, currentEvent: CompetitionEvent) => {
  const existingInvitation = currentEvent.invitations.find((invitation) => {
    if (input.recipientType !== invitation.recipientType) {
      return false;
    }

    if (input.recipientType === "registered_institution") {
      return invitation.institutionId === input.institutionId;
    }

    return invitation.email?.toLowerCase() === input.email?.toLowerCase();
  });

  if (!existingInvitation) {
    return createInvitation(eventId, input);
  }

  return {
    ...existingInvitation,
    institutionId: input.institutionId,
    institutionName: input.institutionName,
    email: input.email,
  };
};

const createRegistrationId = (eventId: string, athleteId: string, discipline: string) => `registration-${eventId}-${athleteId}-${slugify(discipline)}-${Date.now().toString(36)}`;

const persistRuntimeEvents = async () => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(runtimeEvents));
};

const ensureHydrated = async () => {
  if (hydrated) {
    return;
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as CompetitionEvent[];
      runtimeEvents = parsed.map((event) => ({
        ...event,
        registrations: event.registrations ?? [],
      }));
    }
  } catch {
    runtimeEvents = [...seededEvents];
  }

  hydrated = true;
};

const updateRuntimeEvent = async (eventId: string, updater: (currentEvent: CompetitionEvent) => CompetitionEvent) => {
  await ensureHydrated();

  const index = runtimeEvents.findIndex((event) => event.id === eventId);

  if (index < 0) {
    throw new Error("Event not found.");
  }

  const currentEvent = runtimeEvents[index];
  const updatedEvent = updater(currentEvent);
  runtimeEvents = runtimeEvents.map((event, eventIndex) => (eventIndex === index ? updatedEvent : event));
  await persistRuntimeEvents();
  return cloneEvent(updatedEvent);
};

export class LocalEventRepository implements EventRepository {
  async getAll(): Promise<CompetitionEvent[]> {
    await ensureHydrated();
    return sortEvents(runtimeEvents).map(cloneEvent);
  }

  async getByInstitutionId(institutionId: string): Promise<CompetitionEvent[]> {
    await ensureHydrated();
    return sortEvents(runtimeEvents.filter((event) => event.institutionId === institutionId)).map(cloneEvent);
  }

  async getById(id: string): Promise<CompetitionEvent | null> {
    await ensureHydrated();
    const event = runtimeEvents.find((item) => item.id === id);
    return event ? cloneEvent(event) : null;
  }

  async create(institutionId: string, data: CreateEventInput): Promise<CompetitionEvent> {
    await ensureHydrated();

    const now = new Date().toISOString();
    const eventId = `event-${slugify(data.name)}-${Date.now().toString(36)}`;
    const event: CompetitionEvent = {
      id: eventId,
      institutionId,
      name: data.name,
      venue: data.venue,
      startDate: data.startDate,
      startTime: data.startTime,
      durationDays: data.durationDays,
      description: data.description,
      status: "published",
      categories: data.categories.map((category) => createCategory(eventId, category)),
      invitations: data.invitations.map((invitation) => createInvitation(eventId, invitation)),
      registrations: [],
      createdAt: now,
      updatedAt: now,
    };

    runtimeEvents = [event, ...runtimeEvents];
    await persistRuntimeEvents();
    return cloneEvent(event);
  }

  async update(eventId: string, data: Partial<CreateEventInput>): Promise<CompetitionEvent> {
    return updateRuntimeEvent(eventId, (currentEvent) => ({
      ...currentEvent,
      name: data.name ?? currentEvent.name,
      venue: data.venue ?? currentEvent.venue,
      startDate: data.startDate ?? currentEvent.startDate,
      startTime: data.startTime ?? currentEvent.startTime,
      durationDays: data.durationDays ?? currentEvent.durationDays,
      description: data.description ?? currentEvent.description,
      categories: data.categories ? data.categories.map((category) => createCategory(eventId, category)) : currentEvent.categories,
      invitations: data.invitations ? data.invitations.map((invitation) => mergeInvitation(eventId, invitation, currentEvent)) : currentEvent.invitations,
      registrations: currentEvent.registrations,
      updatedAt: new Date().toISOString(),
    }));
  }

  async respondToInvitation(eventId: string, invitationId: string, status: EventInvitationStatus): Promise<CompetitionEvent> {
    return updateRuntimeEvent(eventId, (currentEvent) => ({
      ...currentEvent,
      invitations: currentEvent.invitations.map((invitation) =>
        invitation.id === invitationId ? { ...invitation, status, respondedAt: new Date().toISOString() } : invitation,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  async registerInvitationAthletes(eventId: string, invitationId: string, institutionId: string, registrations: AcceptInvitationRegistrationInput[]): Promise<CompetitionEvent> {
    return updateRuntimeEvent(eventId, (currentEvent) => {
      const invitation = currentEvent.invitations.find((item) => item.id === invitationId);

      if (!invitation) {
        throw new Error("Invitation not found.");
      }

      const nextRegistrations = [
        ...currentEvent.registrations.filter((registration) => registration.invitationId !== invitationId),
        ...registrations.map((registration) => {
          const athleteRegistrationKey = `${registration.athleteId}-${registration.categoryId}-${registration.discipline}`;
          const category = currentEvent.categories.find((item) => item.id === registration.categoryId);

          return {
            id: createRegistrationId(eventId, registration.athleteId, athleteRegistrationKey),
            eventId,
            invitationId,
            institutionId,
            athleteId: registration.athleteId,
            athleteName: registration.athleteName ?? registration.athleteId,
            categoryId: registration.categoryId,
            categoryName: category?.name ?? registration.categoryId,
            discipline: registration.discipline,
            status: "registered" as const,
            createdAt: new Date().toISOString(),
          };
        }),
      ];

      return {
        ...currentEvent,
        registrations: nextRegistrations,
        invitations: currentEvent.invitations.map((item) =>
          item.id === invitationId ? { ...item, status: "accepted" as const, respondedAt: new Date().toISOString() } : item,
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }
}

export const localEventRepository = new LocalEventRepository();
