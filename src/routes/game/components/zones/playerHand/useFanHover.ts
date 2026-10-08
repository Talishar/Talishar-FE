import { useCallback, useEffect, useRef, useState } from 'react';
import { FAN_LAND_DURATION_S } from './fanLayout';

export function useFanHover() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [landingCardIds, setLandingCardIds] = useState<string[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const landTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  const startLanding = useCallback((cardId: string) => {
    const timers = landTimersRef.current;
    clearTimeout(timers.get(cardId));
    timers.set(
      cardId,
      setTimeout(() => {
        timers.delete(cardId);
        setLandingCardIds((ids) => ids.filter((id) => id !== cardId));
      }, FAN_LAND_DURATION_S * 1000)
    );
    setLandingCardIds((ids) => (ids.includes(cardId) ? ids : [...ids, cardId]));
  }, []);

  const moveHover = useCallback(
    (next: string | null) => {
      const previous = hoveredRef.current;
      if (next === previous) return;
      hoveredRef.current = next;
      setHoveredCardId(next);
      if (previous !== null) startLanding(previous);
    },
    [startLanding]
  );

  const handleHoverChange = useCallback(
    (cardId: string, hovering: boolean) => {
      const current = hoveredRef.current;
      moveHover(hovering ? cardId : current === cardId ? null : current);
    },
    [moveHover]
  );

  const clearHover = useCallback(() => moveHover(null), [moveHover]);

  useEffect(() => {
    const timers = landTimersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return { hoveredCardId, landingCardIds, handleHoverChange, clearHover };
}
