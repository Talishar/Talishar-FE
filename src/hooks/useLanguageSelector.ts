import { useCallback, useSyncExternalStore } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  cacheLanguage,
  loadInitialLanguage
} from 'utils/multilanguage/languagePreference';
import {
  areCollectionMapsLoaded,
  subscribeCollectionMaps
} from 'utils/multilanguage/multilanguage';
import {
  setLanguage as setLanguageSlice,
  getSettingsLanguage
} from 'features/options/optionsSlice';

export const useLanguageSelector = () => {
  const dispatch = useAppDispatch();
  const languageLoadedStore = useAppSelector(getSettingsLanguage);
  const collectionMapsLoaded = useSyncExternalStore(
    subscribeCollectionMaps,
    areCollectionMapsLoaded
  );

  const getLanguage = useCallback(
    () => (languageLoadedStore ? languageLoadedStore : loadInitialLanguage()),
    [languageLoadedStore, collectionMapsLoaded]
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
