import { Checkin, HeatAssignment, HeatOrGroup } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

export const listCheckins = () => listDocuments<Checkin>("checkins");
export const createCheckin = (checkin: Checkin) => createDocument("checkins", checkin);
export const updateCheckin = (id: string, data: Partial<Checkin>) => updateDocument<Checkin>("checkins", id, data);
export const saveGeneratedHeat = (heat: HeatOrGroup) => createDocument("heatsOrGroups", heat);
export const saveGeneratedAssignment = (assignment: HeatAssignment) =>
  createDocument("heatAssignments", assignment);
