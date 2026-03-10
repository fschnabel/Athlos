import { Event, EventDiscipline, EventRegistration, HeatAssignment, HeatOrGroup } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

export const createEvent = (event: Event) => createDocument("events", event);
export const updateEvent = (id: string, data: Partial<Event>) => updateDocument<Event>("events", id, data);
export const listEvents = () => listDocuments<Event>("events");

export const createEventDiscipline = (discipline: EventDiscipline) =>
  createDocument("eventDisciplines", discipline);
export const listEventDisciplines = () => listDocuments<EventDiscipline>("eventDisciplines");

export const createEventRegistration = (registration: EventRegistration) =>
  createDocument("eventRegistrations", registration);
export const listEventRegistrations = () => listDocuments<EventRegistration>("eventRegistrations");

export const saveHeat = (heat: HeatOrGroup) => createDocument("heatsOrGroups", heat);
export const saveAssignment = (assignment: HeatAssignment) => createDocument("heatAssignments", assignment);
