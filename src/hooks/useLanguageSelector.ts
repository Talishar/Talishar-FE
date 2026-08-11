import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { cacheLanguage, loadInitialLanguage } from 'utils';
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
      dispatch(setLanguageSlice({ languageSelected }));
      localStorage.setItem('language', languageSelected);
      cacheLanguage(languageSelected);
    },
    [dispatch]
  );

  return {
    getLanguage,
    setLanguage
  };
};
