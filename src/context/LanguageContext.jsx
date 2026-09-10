import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import en from "../locales/en";
import hi from "../locales/hi";

const LanguageContext = createContext();

const translations = {
  en,
  hi,
};

export const LanguageProvider = ({
  children,
}) => {
  const [language, setLanguage] = useState(() => {
    return (
      localStorage.getItem("cafe-language") ||
      "en"
    );
  });

  useEffect(() => {
    localStorage.setItem(
      "cafe-language",
      language
    );
  }, [language]);

  const t = translations[language];

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
};