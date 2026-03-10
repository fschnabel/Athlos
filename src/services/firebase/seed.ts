import { DEFAULT_CATEGORIES } from "@/constants/seedCategories";
import { DEFAULT_DISCIPLINES } from "@/constants/disciplines";

import { createDocument } from "./firestore";

export const seedBaseCatalogs = async () => {
  await Promise.all([
    ...DEFAULT_CATEGORIES.map((category) => createDocument("categories", category)),
    ...DEFAULT_DISCIPLINES.map((discipline) => createDocument("disciplines", discipline)),
  ]);
};
