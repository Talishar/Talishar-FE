import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import gameReducer from '../features/game/GameSlice';
import type { PreloadedState } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    game: gameReducer
  }
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: {
      game: gameReducer
    },
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
