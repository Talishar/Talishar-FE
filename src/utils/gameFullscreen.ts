import { useSyncExternalStore } from 'react';
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

let fanFullscreenWidth = 0;
const fanFullscreenWidthSubscribers = new Set<() => void>();

export const setFanFullscreenWidth = (width: number) => {
  if (width === fanFullscreenWidth) return;
  fanFullscreenWidth = width;
  fanFullscreenWidthSubscribers.forEach((subscriber) => subscriber());
};

export const getFanFullscreenWidth = () => fanFullscreenWidth;

const subscribeFanFullscreenWidth = (subscriber: () => void) => {
  fanFullscreenWidthSubscribers.add(subscriber);
  return () => {
    fanFullscreenWidthSubscribers.delete(subscriber);
  };
};

export const useFanFullscreenWidth = () =>
  useSyncExternalStore(
    subscribeFanFullscreenWidth,
    getFanFullscreenWidth,
    () => 0
  );
