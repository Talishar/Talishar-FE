import screenfull from 'screenfull';

let gameFullscreenTurnedOff = false;

export const toggleGameFullscreen = () => {
  gameFullscreenTurnedOff = screenfull.isFullscreen;
  screenfull.toggle();
};

export const isGameFullscreenTurnedOff = () => gameFullscreenTurnedOff;

export const resetGameFullscreenTurnedOff = () => {
  gameFullscreenTurnedOff = false;
};
