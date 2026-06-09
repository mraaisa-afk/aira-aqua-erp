import { useCallback, useState, useEffect } from "react";

type Locale = "en" | "bn";

interface Translations {
  [key: string]: any;
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load locale from localStorage or browser language
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    const browserLocale = navigator.language.startsWith("bn") ? "bn" : "en";
    const initialLocale = savedLocale || browserLocale;

    setLocale(initialLocale);
    loadTranslations(initialLocale);
  }, []);

  const loadTranslations = useCallback(async (lang: Locale) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/locales/${lang}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English
      if (lang !== "en") {
        loadTranslations("en");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    loadTranslations(newLocale);
  }, [loadTranslations]);

  const t = useCallback(
    (key: string, defaultValue: string = key): string => {
      const keys = key.split(".");
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          return defaultValue;
        }
      }

      return typeof value === "string" ? value : defaultValue;
    },
    [translations]
  );

  return {
    locale,
    changeLocale,
    t,
    isLoading,
  };
}
