import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { ar } from "./ar";

type TranslationType = typeof en;
type Language = "EN" | "AR";

interface TranslationContextType {
  t: TranslationType;
  language: Language;
  setLanguage: (lang: Language) => void;
  isAr: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>(() => (localStorage.getItem("labella_lang") as Language) || "EN");

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("labella_lang", lang);
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = lang.toLowerCase();
  };

  useEffect(() => {
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const t = language === "AR" ? (ar as TranslationType) : en;

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage, isAr: language === "AR" }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used within TranslationProvider");
  return context;
};
