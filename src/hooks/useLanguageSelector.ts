import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  cacheLanguage,
  loadInitialLanguage
} from 'utils/multilanguage/languagePreference';
import { DEFAULT_LANGUAGE } from 'utils/multilanguage/constants';
import { ensureCollectionMapsForLocale } from 'utils/multilanguage/multilanguage';
import {
  setLanguage as setLanguageSlice,
  getSettingsLanguage
} from 'features/options/optionsSlice';

export const useLanguageSelector = () => {
  const dispatch = useAppDispatch();
  const languageLoadedStore = useAppSelector(getSettingsLanguage);

  const getLanguage = useCallback(
    () => (languageLoadedStore ? languageLoadedStore : loadInitialLanguage()),
    [languageLoadedStore]
  );

  const setLanguage = useCallback(
    (languageSelected: string) => {
      const apply = () => {
        dispatch(setLanguageSlice({ languageSelected }));
        localStorage.setItem('language', languageSelected);
        cacheLanguage(languageSelected);
      };

      if (languageSelected === DEFAULT_LANGUAGE) {
        apply();
        return;
      }
      void ensureCollectionMapsForLocale(languageSelected).then(apply, apply);
    },
    [dispatch]
  );

  return {
    getLanguage,
    setLanguage
  };
};
