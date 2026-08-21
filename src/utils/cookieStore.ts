import { useSyncExternalStore } from 'react';
import Cookies from 'universal-cookie';

export const appCookies = new Cookies();

type CookieBag = Record<string, unknown>;

let rawCookie = typeof document === 'undefined' ? '' : document.cookie;
let snapshot: CookieBag = appCookies.getAll();
const subscribers = new Set<() => void>();

const syncFromDocument = (): boolean => {
  if (typeof document === 'undefined') return false;
  const current = document.cookie;
  if (current === rawCookie) return false;
  rawCookie = current;
  snapshot = appCookies.getAll();
  return true;
};

const notify = () => {
  for (const subscriber of subscribers) subscriber();
};

const refresh = () => {
  rawCookie = typeof document === 'undefined' ? '' : document.cookie;
  const next = appCookies.getAll();

  const prevKeys = Object.keys(snapshot);
  const nextKeys = Object.keys(next);
  let changed = prevKeys.length !== nextKeys.length;
  if (!changed) {
    for (const key of nextKeys) {
      if (snapshot[key] !== next[key]) {
        changed = true;
        break;
      }
    }
  }

  snapshot = next;
  if (changed) notify();
};

appCookies.addChangeListener(refresh);

if (typeof document !== 'undefined') {
  const resync = () => {
    if (syncFromDocument()) notify();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resync();
  });
  window.addEventListener('focus', resync);
}

const subscribe = (onStoreChange: () => void) => {
  subscribers.add(onStoreChange);
  return () => {
    subscribers.delete(onStoreChange);
  };
};

const getters = new Map<string, () => unknown>();
const getterFor = (name: string) => {
  let getter = getters.get(name);
  if (getter === undefined) {
    getter = () => {
      syncFromDocument();
      return snapshot[name];
    };
    getters.set(name, getter);
  }
  return getter;
};

export function useCookieValue(name: string): unknown {
  const getter = getterFor(name);
  return useSyncExternalStore(subscribe, getter, getter);
}

export function useCookieString(name: string): string | undefined {
  const value = useCookieValue(name);
  return typeof value === 'string' ? value : undefined;
}

export function readCookie(name: string): unknown {
  syncFromDocument();
  return snapshot[name];
}

export function refreshCookieSnapshot(): void {
  if (syncFromDocument()) notify();
}
