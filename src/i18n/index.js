import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend) // Loads translations from a backend or local files
  .use(LanguageDetector) // Detects language automatically (from browser or query string)
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    fallbackLng: "en", // Default language if the detected language is not available
    debug: true, // Enable debug mode (you can disable this in production)
    interpolation: {
      escapeValue: false, // React already escapes values to prevent XSS
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // Path to the translation files
    },
  });

export default i18n;