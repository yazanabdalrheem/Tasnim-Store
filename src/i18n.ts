import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import he from "./i18n/locales/he";
import ar from "./i18n/locales/ar";
import en from "./i18n/locales/en";

const resources = {
  he: { translation: he },
  ar: { translation: ar },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "he", // Default language
    fallbackLng: "he",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false // Avoid hydration mismatch if using SSR, but safe here too
    }
  });

export default i18n;
