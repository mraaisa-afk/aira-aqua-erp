"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useI18n } from "@/hooks/useI18n";

interface I18nContextType {
  locale: "en" | "bn";
  changeLocale: (locale: "en" | "bn") => void;
  t: (key: string, defaultValue?: string) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
