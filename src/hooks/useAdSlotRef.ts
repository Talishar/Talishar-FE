import { useCallback, useRef } from 'react';
import { observeAdSlot } from 'utils/adAnalytics';

export default function useAdSlotRef<T extends HTMLElement>() {
  const release = useRef<(() => void) | null>(null);
  return useCallback((el: T | null) => {
    release.current?.();
    release.current = el ? observeAdSlot(el) : null;
  }, []);
}
