import { Coach } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

const COLLECTION = "coaches";

export const createCoach = (coach: Coach) => createDocument(COLLECTION, coach);
export const listCoaches = () => listDocuments<Coach>(COLLECTION);
export const updateCoach = (id: string, data: Partial<Coach>) => updateDocument<Coach>(COLLECTION, id, data);
