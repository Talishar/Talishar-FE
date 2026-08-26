import { DEFAULT_LANGUAGE } from './constants';

let cachedLanguage: string | null | undefined;

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'language' || event.key === null) {
      cachedLanguage = undefined;
    }
  });
}

export const cacheLanguage = (language: string) => {
  cachedLanguage = language;
};

export const invalidateLanguageCache = () => {
  cachedLanguage = undefined;
};

export const loadInitialLanguage = () => {
  if (cachedLanguage === undefined) {
    cachedLanguage = localStorage.getItem('language');
  }
  return cachedLanguage || DEFAULT_LANGUAGE;
};
