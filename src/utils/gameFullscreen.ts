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

export const isAppleTouchDevice = () => {
  const { userAgent, maxTouchPoints } = window.navigator;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  );
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
};

let landscapeLocked = false;
let landscapeLockEnteredFullscreen = false;

const clearLandscapeLock = () => {
  if (document.fullscreenElement) return;
  landscapeLocked = false;
  landscapeLockEnteredFullscreen = false;
  document.removeEventListener('fullscreenchange', clearLandscapeLock);
};

export const canLockLandscape = () =>
  screenfull.isEnabled &&
  window.navigator.maxTouchPoints > 0 &&
  !isAppleTouchDevice() &&
  typeof (window.screen.orientation as LockableScreenOrientation | undefined)
    ?.lock === 'function';

export const isLandscapeLocked = () => landscapeLocked;

export const lockLandscape = async () => {
  const enterFullscreen = !document.fullscreenElement;
  try {
    if (enterFullscreen) await document.documentElement.requestFullscreen();
    await (window.screen.orientation as LockableScreenOrientation).lock?.(
      'landscape'
    );
    landscapeLocked = true;
    landscapeLockEnteredFullscreen = enterFullscreen;
    document.addEventListener('fullscreenchange', clearLandscapeLock);
  } catch {
    if (enterFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  }
};

export const unlockLandscape = () => {
  window.screen.orientation.unlock();
  if (landscapeLockEnteredFullscreen) {
    document.exitFullscreen().catch(() => undefined);
    return;
  }
  landscapeLocked = false;
  document.removeEventListener('fullscreenchange', clearLandscapeLock);
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
