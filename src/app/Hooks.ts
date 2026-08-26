import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore
} from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './Store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore as () => AppStore;
