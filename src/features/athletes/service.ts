import { Athlete } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

const COLLECTION = "athletes";

export const createAthlete = (athlete: Athlete) => createDocument(COLLECTION, athlete);
export const listAthletes = () => listDocuments<Athlete>(COLLECTION);
export const updateAthlete = (id: string, data: Partial<Athlete>) =>
  updateDocument<Athlete>(COLLECTION, id, data);
