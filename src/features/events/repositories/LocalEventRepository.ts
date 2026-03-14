import seedEvents from "@/mocks/events.json";
import { CompetitionEvent, CreateEventCategoryInput, CreateEventInput, CreateEventInvitationInput } from "@/types/events";

import { EventRepository } from "./EventRepository";

const seededEvents = seedEvents as CompetitionEvent[];
let runtimeEvents = [...seededEvents];

const cloneEvent = (event: CompetitionEvent): CompetitionEvent => ({
  ...event,
  categories: event.categories.map((category) => ({ ...category, disciplines: [...category.disciplines] })),
  invitations: event.invitations.map((invitation) => ({ ...invitation })),
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

export class LocalEventRepository implements EventRepository {
  async getByInstitutionId(institutionId: string): Promise<CompetitionEvent[]> {
    return sortEvents(runtimeEvents.filter((event) => event.institutionId === institutionId)).map(cloneEvent);
  }

  async getById(id: string): Promise<CompetitionEvent | null> {
    const event = runtimeEvents.find((item) => item.id === id);
    return event ? cloneEvent(event) : null;
  }

  async create(institutionId: string, data: CreateEventInput): Promise<CompetitionEvent> {
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
      createdAt: now,
      updatedAt: now,
    };

    runtimeEvents = [event, ...runtimeEvents];
    return cloneEvent(event);
  }

  async update(eventId: string, data: Partial<CreateEventInput>): Promise<CompetitionEvent> {
    const index = runtimeEvents.findIndex((event) => event.id === eventId);

    if (index < 0) {
      throw new Error("Event not found.");
    }

    const currentEvent = runtimeEvents[index];
    const updatedEvent: CompetitionEvent = {
      ...currentEvent,
      name: data.name ?? currentEvent.name,
      venue: data.venue ?? currentEvent.venue,
      startDate: data.startDate ?? currentEvent.startDate,
      startTime: data.startTime ?? currentEvent.startTime,
      durationDays: data.durationDays ?? currentEvent.durationDays,
      description: data.description ?? currentEvent.description,
      categories: data.categories ? data.categories.map((category) => createCategory(eventId, category)) : currentEvent.categories,
      invitations: data.invitations ? data.invitations.map((invitation) => createInvitation(eventId, invitation)) : currentEvent.invitations,
      updatedAt: new Date().toISOString(),
    };

    runtimeEvents = runtimeEvents.map((event, eventIndex) => (eventIndex === index ? updatedEvent : event));
    return cloneEvent(updatedEvent);
  }
}

export const localEventRepository = new LocalEventRepository();
