/** Sync with `public/locales/<code>/translation.json`. Add a code here when adding a locale. */
export const I18N_SUPPORTED_LANGUAGE_CODES = ['en', 'fr', 'ja'] as const;

export type I18nSupportedLanguageCode =
  (typeof I18N_SUPPORTED_LANGUAGE_CODES)[number];

export const I18N_LANGUAGE_LABELS: Record<I18nSupportedLanguageCode, string> = {
  en: 'English',
  fr: 'Français',
  ja: '日本語'
};
