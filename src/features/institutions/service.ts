import { Institution } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

const COLLECTION = "institutions";

export const createInstitution = (institution: Institution) => createDocument(COLLECTION, institution);
export const listInstitutions = () => listDocuments<Institution>(COLLECTION);
export const updateInstitution = (id: string, data: Partial<Institution>) =>
  updateDocument<Institution>(COLLECTION, id, data);
