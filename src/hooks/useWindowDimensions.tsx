import { useSyncExternalStore } from 'react';

type WindowDimensions = [number, number];

const SERVER_DIMENSIONS: WindowDimensions = [0, 0];
let dimensions: WindowDimensions =
  typeof window === 'undefined'
    ? SERVER_DIMENSIONS
    : [window.innerWidth, window.innerHeight];
let animationFrame: number | undefined;
const subscribers = new Set<() => void>();

const updateDimensions = (): boolean => {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  const height = window.innerHeight;
  if (dimensions[0] === width && dimensions[1] === height) return false;

  dimensions = [width, height];
  return true;
};

const notifySubscribers = () => {
  subscribers.forEach((subscriber) => subscriber());
};

const handleResize = () => {
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(() => {
    animationFrame = undefined;
    if (updateDimensions()) notifySubscribers();
  });
};

const subscribe = (subscriber: () => void) => {
  const isFirstSubscriber = subscribers.size === 0;
  subscribers.add(subscriber);

  if (isFirstSubscriber && typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize, { passive: true });
    if (updateDimensions()) notifySubscribers();
  }

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    }
  };
};

const getSnapshot = () => dimensions;
const getServerSnapshot = () => SERVER_DIMENSIONS;

export default function useWindowDimensions(): [number, number] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
