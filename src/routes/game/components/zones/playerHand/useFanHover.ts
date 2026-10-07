import { useCallback, useEffect, useRef, useState } from 'react';

export const FAN_UNHOVER_GRACE_MS = 100;

export function useFanHover(graceMs = FAN_UNHOVER_GRACE_MS) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClearId = useRef<string | null>(null);

  const cancelClear = useCallback(() => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = null;
    pendingClearId.current = null;
  }, []);

  const handleHoverChange = useCallback(
    (cardId: string, hovering: boolean) => {
      if (hovering) {
        cancelClear();
        setHoveredCardId(cardId);
        return;
      }
      if (pendingClearId.current === cardId) return;
      cancelClear();
      pendingClearId.current = cardId;
      clearTimer.current = setTimeout(() => {
        clearTimer.current = null;
        pendingClearId.current = null;
        setHoveredCardId((current) => (current === cardId ? null : current));
      }, graceMs);
    },
    [cancelClear, graceMs]
  );

  const clearHover = useCallback(() => {
    cancelClear();
    setHoveredCardId(null);
  }, [cancelClear]);

  useEffect(() => cancelClear, [cancelClear]);

  return { hoveredCardId, handleHoverChange, clearHover };
}
