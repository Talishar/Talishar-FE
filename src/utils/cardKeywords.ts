import { useSyncExternalStore } from 'react';

type CardKeywordModule =
  typeof import('data/keywords/generated/cardKeywordMap');

type KeywordMaps = {
  community: CardKeywordModule;
  backend: CardKeywordModule;
};

let loaded: KeywordMaps | null = null;
let inFlight: Promise<void> | null = null;
let reportedFailure = false;
const listeners = new Set<() => void>();

export function prefetchCardKeywords(): void {
  if (loaded !== null || inFlight !== null) return;
  inFlight = Promise.all([
    import('data/keywords/generated/cardKeywordMap'),
    import('data/keywords/generated/backendCardKeywordMap')
  ])
    .then(([community, backend]) => {
      loaded = { community, backend };
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

const lookup = (
  module: CardKeywordModule,
  cardNumber: string
): string[] | undefined => {
  const indexes = module.CARD_KEYWORD_MAP[cardNumber];
  if (!indexes || indexes.length === 0) return undefined;
  return indexes.map((i) => module.KEYWORD_STRINGS[i]);
};

export const useCardKeywords = (cardNumber?: string): string[] | undefined => {
  const maps = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (maps === null) {
    prefetchCardKeywords();
    return undefined;
  }
  if (!cardNumber) return undefined;
  // The community dataset trails new sets by a release or two, so cards it has
  // not caught up with fall back to the map built from the Talishar backend.
  return lookup(maps.community, cardNumber) ?? lookup(maps.backend, cardNumber);
};
