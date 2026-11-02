import type { RootState } from 'app/Store';
import Player from 'features/Player';

export const selectIsP2View = (state: RootState): boolean =>
  (state.game.gameInfo.playerID === 3 || !!state.game.gameInfo.isReplay) &&
  state.game.spectatorCameraView === 2;

export const selectSidePlayer = (state: RootState, isPlayer: boolean): Player =>
  isPlayer === selectIsP2View(state)
    ? state.game.playerTwo
    : state.game.playerOne;
