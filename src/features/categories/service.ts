import { Category } from "@/types/domain";

import { createDocument, listDocuments, updateDocument } from "@/services/firebase/firestore";

const COLLECTION = "categories";

export const createCategory = (category: Category) => createDocument(COLLECTION, category);
export const listCategories = () => listDocuments<Category>(COLLECTION);
export const updateCategory = (id: string, data: Partial<Category>) =>
  updateDocument<Category>(COLLECTION, id, data);
