import { useState } from 'react';

const STORAGE_KEY = 'modHideBanned';

export default function useHideBanned() {
  const [hideBanned, setHideBannedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const setHideBanned = (value: boolean) => {
    setHideBannedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // ignore
    }
  };

  return [hideBanned, setHideBanned] as const;
}
