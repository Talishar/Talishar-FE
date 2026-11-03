import { useCallback, useRef } from 'react';
import { markAdSlotIfUnavailable, observeAdSlot } from 'utils/adAnalytics';

export default function useAdSlotRef<T extends HTMLElement>() {
  const release = useRef<(() => void) | null>(null);
  return useCallback((el: T | null) => {
    release.current?.();
    if (el) markAdSlotIfUnavailable(el);
    release.current = el ? observeAdSlot(el) : null;
  }, []);
}
