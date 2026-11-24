import { useState } from 'react';

export default function useHideBanned(storageKey: string) {
  const [hideBanned, setHideBannedState] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  const setHideBanned = (value: boolean) => {
    setHideBannedState(value);
    try {
      localStorage.setItem(storageKey, value ? '1' : '0');
    } catch {
      // ignore
    }
  };

  return [hideBanned, setHideBanned] as const;
}
