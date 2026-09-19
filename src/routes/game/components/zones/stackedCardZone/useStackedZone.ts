import { useMemo } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useMediaQuery } from 'hooks/useMediaQuery';
import * as optConst from 'features/options/constants';

export const MAX_STACK_LAYERS = 12;

export const useAlwaysShowCounters = () =>
  useAppSelector(
    (state: RootState) =>
      String(
        state.settings.entities?.[optConst.ALWAYS_SHOW_COUNTERS]?.value
      ) === '1'
  );

export const useStackedZoneGeometry = (totalCards: number) => {
  const isMobileOrTablet = useMediaQuery('(max-width: 1024px)');
  const baseOffsetY = totalCards * -0.24;
  const baseOffsetX = totalCards * 0.24;

  const layerStyles = useMemo(() => {
    if (totalCards <= 1) return [];
    const layerCount = Math.min(MAX_STACK_LAYERS, totalCards - 1);
    return Array.from({ length: layerCount }, (_, index) => {
      const sourceIndex =
        layerCount === 1
          ? 0
          : Math.round((index * (totalCards - 2)) / (layerCount - 1));

      return {
        transform:
          `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) ` +
          `translateY(${(sourceIndex + 1) * 0.25}px) translateX(${
            (sourceIndex + 1) * -0.25
          }px)`,
        zIndex: totalCards - sourceIndex - 1
      };
    });
  }, [totalCards, baseOffsetY, baseOffsetX]);

  const cardWrapperStyle = useMemo(
    () =>
      !isMobileOrTablet
        ? {
            transform: `translate3d(${Math.round(baseOffsetX)}px, ${Math.round(
              baseOffsetY
            )}px, 0)`
          }
        : undefined,
    [isMobileOrTablet, baseOffsetY, baseOffsetX]
  );

  return {
    isMobileOrTablet,
    baseOffsetX,
    baseOffsetY,
    layerStyles,
    cardWrapperStyle
  };
};
