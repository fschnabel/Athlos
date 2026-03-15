import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type SupportedLanguage = "es" | "en" | "de";

const STORAGE_KEY = "athlos.language";

const detectDeviceLanguage = (): SupportedLanguage => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();

  if (locale.startsWith("de")) {
    return "de";
  }

  if (locale.startsWith("en")) {
    return "en";
  }

  return "es";
};

interface LanguageStore {
  language: SupportedLanguage;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: detectDeviceLanguage(),
  hydrated: false,
  hydrate: async () => {
    const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

    if (storedLanguage === "es" || storedLanguage === "en" || storedLanguage === "de") {
      set({ language: storedLanguage, hydrated: true });
      return;
    }

    set({ hydrated: true });
  },
  setLanguage: async (language) => {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    set({ language });
  },
}));
