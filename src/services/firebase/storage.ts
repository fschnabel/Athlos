import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "./app";

export const uploadFile = async (path: string, blob: Blob) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};
