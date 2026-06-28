import React, { createContext, useContext, useState, useEffect } from "react";
import { ar } from "./ar";

type TranslationType = typeof ar;
type Language = "AR";

interface TranslationContextType {
  t: TranslationType;
  language: Language;
  setLanguage: (lang: Language) => void;
  isAr: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>("AR");

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("labella_lang", "AR");
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  };

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  const t = ar;

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage, isAr: true }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used within TranslationProvider");
  return context;
};
