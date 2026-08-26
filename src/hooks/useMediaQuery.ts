import { useSyncExternalStore } from 'react';

type MediaQueryStore = {
  getSnapshot: () => boolean;
  subscribe: (listener: () => void) => () => void;
};

const stores = new Map<string, MediaQueryStore>();

const serverStore: MediaQueryStore = {
  getSnapshot: () => false,
  subscribe: () => () => undefined
};

const createStore = (query: string): MediaQueryStore => {
  const mediaQuery = window.matchMedia(query);
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    getSnapshot: () => mediaQuery.matches,
    subscribe: (listener) => {
      if (listeners.size === 0) {
        mediaQuery.addEventListener('change', notify);
      }
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          mediaQuery.removeEventListener('change', notify);
        }
      };
    }
  };
};

const getStore = (query: string): MediaQueryStore => {
  if (typeof window === 'undefined') return serverStore;

  let store = stores.get(query);
  if (store === undefined) {
    store = createStore(query);
    stores.set(query, store);
  }
  return store;
};

export function useMediaQuery(query: string): boolean {
  const store = getStore(query);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    serverStore.getSnapshot
  );
}
