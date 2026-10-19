import { useCallback, useEffect, useRef, useState } from 'react';
import { FAN_LAND_DURATION_S, FAN_SWITCH_LAND_DURATION_S } from './fanLayout';

export function useFanHover(slowSwitch = false) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [landingCardIds, setLandingCardIds] = useState<string[]>([]);
  const [slowLandingCardIds, setSlowLandingCardIds] = useState<string[]>([]);
  const [hoverSwitched, setHoverSwitched] = useState(false);
  const slowSwitchRef = useRef(slowSwitch);
  slowSwitchRef.current = slowSwitch;
  const hoveredRef = useRef<string | null>(null);
  const landTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  const startLanding = useCallback((cardId: string, slow: boolean) => {
    const timers = landTimersRef.current;
    clearTimeout(timers.get(cardId));
    timers.set(
      cardId,
      setTimeout(() => {
        timers.delete(cardId);
        setLandingCardIds((ids) => ids.filter((id) => id !== cardId));
        setSlowLandingCardIds((ids) => ids.filter((id) => id !== cardId));
      }, (slow ? FAN_SWITCH_LAND_DURATION_S : FAN_LAND_DURATION_S) * 1000)
    );
    setLandingCardIds((ids) => (ids.includes(cardId) ? ids : [...ids, cardId]));
    setSlowLandingCardIds((ids) =>
      slow
        ? ids.includes(cardId)
          ? ids
          : [...ids, cardId]
        : ids.filter((id) => id !== cardId)
    );
  }, []);

  const moveHover = useCallback(
    (next: string | null) => {
      const previous = hoveredRef.current;
      if (next === previous) return;
      hoveredRef.current = next;
      setHoveredCardId(next);
      const switched = previous !== null && next !== null;
      setHoverSwitched(switched);
      if (previous !== null) {
        startLanding(previous, switched && slowSwitchRef.current);
      }
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
  const getHoveredCardId = useCallback(() => hoveredRef.current, []);

  useEffect(() => {
    const timers = landTimersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return {
    hoveredCardId,
    landingCardIds,
    slowLandingCardIds,
    hoverSwitched,
    handleHoverChange,
    clearHover,
    getHoveredCardId
  };
}
