import { useCallback, useEffect, useMemo } from "react";

import { SupportedLanguage, useLanguageStore } from "@/store/language-store";

import { translations } from "./translations";

const resolveValue = (source: Record<string, any>, path: string): string => {
  return path.split(".").reduce<any>((current, key) => current?.[key], source) ?? path;
};

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (current, [key, value]) => current.replace(new RegExp(`{{${key}}}`, "g"), String(value)),
    template,
  );
};

export const useI18n = () => {
  const language = useLanguageStore((state) => state.language);
  const setLanguageStore = useLanguageStore((state) => state.setLanguage);
  const hydrate = useLanguageStore((state) => state.hydrate);
  const hydrated = useLanguageStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = resolveValue(translations[language], key);
      return interpolate(value, params);
    },
    [language],
  );

  const formatDate = useCallback((value: string | Date) => new Date(value).toLocaleDateString(language), [language]);

  const setLanguage = useCallback(
    (nextLanguage: SupportedLanguage) => {
      void setLanguageStore(nextLanguage);
    },
    [setLanguageStore],
  );

  return useMemo(
    () => ({
      language,
      setLanguage,
      t,
      formatDate,
    }),
    [formatDate, language, setLanguage, t],
  );
};
