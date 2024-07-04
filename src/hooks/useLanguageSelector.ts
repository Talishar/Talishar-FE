import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { loadInitialLanguage } from 'utils';
import {
  setLanguage as setLanguageSlice,
  getSettingsLanguage
} from 'features/options/optionsSlice';

export const useLanguageSelector = () => {
  const dispatch = useAppDispatch();
  const languageLoadedStore = useAppSelector(getSettingsLanguage);

  const getLanguage = () => languageLoadedStore ? languageLoadedStore : loadInitialLanguage();

  const setLanguage = (languageSelected: string) => {
    dispatch(setLanguageSlice({ languageSelected }));
    localStorage.setItem('language', languageSelected);
  };

  return {
    getLanguage,
    setLanguage
  };
};
