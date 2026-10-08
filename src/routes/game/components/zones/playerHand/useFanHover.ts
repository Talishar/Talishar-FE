import { useCallback, useEffect, useState } from 'react';
import {
  FAN_LAND_DURATION_S,
  FAN_SWITCH_LAND_DURATION_S
} from './fanLayout';

type FanHoverState = {
  hoveredCardId: string | null;
  landingCardId: string | null;
};

const NO_HOVER: FanHoverState = { hoveredCardId: null, landingCardId: null };

export function useFanHover() {
  const [state, setState] = useState<FanHoverState>(NO_HOVER);

  const handleHoverChange = useCallback((cardId: string, hovering: boolean) => {
    setState((current) => {
      const next = hovering
        ? cardId
        : current.hoveredCardId === cardId
        ? null
        : current.hoveredCardId;
      if (next === current.hoveredCardId) return current;
      return { hoveredCardId: next, landingCardId: current.hoveredCardId };
    });
  }, []);

  const clearHover = useCallback(() => {
    setState((current) =>
      current.hoveredCardId === null
        ? current
        : { hoveredCardId: null, landingCardId: current.hoveredCardId }
    );
  }, []);

  useEffect(() => {
    if (state.landingCardId === null) return;
    const timer = setTimeout(
      () =>
        setState((current) =>
          current.landingCardId === null
            ? current
            : { ...current, landingCardId: null }
        ),
      (state.hoveredCardId === null
        ? FAN_LAND_DURATION_S
        : FAN_SWITCH_LAND_DURATION_S) * 1000
    );
    return () => clearTimeout(timer);
  }, [state.landingCardId, state.hoveredCardId]);

  return {
    hoveredCardId: state.hoveredCardId,
    landingCardId: state.landingCardId,
    handleHoverChange,
    clearHover
  };
}
