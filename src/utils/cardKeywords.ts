import { useSyncExternalStore } from 'react';

type CardKeywordModule =
  typeof import('data/keywords/generated/cardKeywordMap');

let loaded: CardKeywordModule | null = null;
let inFlight: Promise<void> | null = null;
let reportedFailure = false;
const listeners = new Set<() => void>();

export function prefetchCardKeywords(): void {
  if (loaded !== null || inFlight !== null) return;
  inFlight = import('data/keywords/generated/cardKeywordMap')
    .then((module) => {
      loaded = module;
      for (const listener of listeners) listener();
    })
    .catch((error) => {
      if (!reportedFailure) {
        reportedFailure = true;
        console.error('Failed to load card keyword map:', error);
      }
    })
    .finally(() => {
      inFlight = null;
    });
}

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
};

const getSnapshot = () => loaded;

export const useCardKeywords = (cardNumber?: string): string[] | undefined => {
  const module = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (module === null) {
    prefetchCardKeywords();
    return undefined;
  }
  if (!cardNumber) return undefined;
  const indexes = module.CARD_KEYWORD_MAP[cardNumber];
  if (!indexes || indexes.length === 0) return undefined;
  return indexes.map((i) => module.KEYWORD_STRINGS[i]);
};
