import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import gameReducer from '../features/game/GameSlice';
import type { PreloadedState } from '@reduxjs/toolkit';
import { apiSlice, rtkQueryErrorToaster } from '../features/api/apiSlice';
import authReducer from 'features/auth/authSlice';
import optionReducer from 'features/options/optionsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    settings: optionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([rtkQueryErrorToaster, apiSlice.middleware])
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: {
      game: gameReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: authReducer,
      settings: optionReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([
        rtkQueryErrorToaster,
        apiSlice.middleware
      ]),
    preloadedState
  });
};

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
