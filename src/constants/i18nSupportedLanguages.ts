/** Sync with `public/locales/<code>/translation.json`. Add a code here when adding a locale. */
export const I18N_SUPPORTED_LANGUAGE_CODES = ['en', 'fr', 'ja'] as const;

export type I18nSupportedLanguageCode =
  (typeof I18N_SUPPORTED_LANGUAGE_CODES)[number];
