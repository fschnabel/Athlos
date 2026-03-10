import {
  CollectionReference,
  QueryConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";

import { db } from "./app";

const withCreateAudit = <T extends object>(data: T) => {
  const now = new Date().toISOString();
  const existingCreatedAt = (data as { createdAt?: string }).createdAt;
  return {
    ...data,
    updatedAt: now,
    createdAt: existingCreatedAt ?? now,
  };
};

const withUpdateAudit = <T extends object>(data: T) => ({
  ...data,
  updatedAt: new Date().toISOString(),
});

export const colRef = <T>(path: string) => collection(db, path) as CollectionReference<T>;

export const createDocument = async <T extends { id?: string }>(path: string, data: T) => {
  if (data.id) {
    await setDoc(doc(db, path, data.id), withCreateAudit(data));
    return data.id;
  }

  const reference = await addDoc(collection(db, path), withCreateAudit(data));
  return reference.id;
};

export const updateDocument = async <T extends object>(
  path: string,
  id: string,
  data: Partial<T>,
) => {
  await setDoc(doc(db, path, id), withUpdateAudit(data), { merge: true });
};

export const getDocument = async <T>(path: string, id: string) => {
  const snapshot = await getDoc(doc(db, path, id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
};

export const listDocuments = async <T>(path: string, ...constraints: QueryConstraint[]) => {
  const snapshot = constraints.length
    ? await getDocs(query(collection(db, path), ...constraints))
    : await getDocs(collection(db, path));

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
};

export const deleteDocument = async (path: string, id: string) => {
  await deleteDoc(doc(db, path, id));
};
