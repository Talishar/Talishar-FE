import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { I18N_SUPPORTED_LANGUAGE_CODES } from './constants/i18nSupportedLanguages';

i18n
  .use(Backend)
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [...I18N_SUPPORTED_LANGUAGE_CODES],
    showSupportNotice: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    backend: {
      // Locale files live in public and are fetched at runtime.
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    react: {
      useSuspense: false
    }
  });

// Keep <html lang> in sync so screen readers and search engines see the
// language the user is actually reading.
const syncDocumentLanguage = (language: string) => {
  if (typeof document === 'undefined' || !language) return;
  document.documentElement.lang = language;
};

syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
