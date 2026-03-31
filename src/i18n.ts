import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { I18N_SUPPORTED_LANGUAGE_CODES } from './constants/i18nSupportedLanguages';

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
    supportedLngs: [...I18N_SUPPORTED_LANGUAGE_CODES],
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;
