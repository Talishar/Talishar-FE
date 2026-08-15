import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { I18N_SUPPORTED_LANGUAGE_CODES } from './constants/i18nSupportedLanguages';
import enTranslations from '../public/locales/en/translation.json';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)

i18n
  .use(Backend)
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    partialBundledLanguages: true,
    supportedLngs: [...I18N_SUPPORTED_LANGUAGE_CODES],
    showSupportNotice: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: enTranslations
      }
    },
    backend: {
      // Other languages will still fetch from this public URL
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
