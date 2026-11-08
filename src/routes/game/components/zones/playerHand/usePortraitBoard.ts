import { useLayoutEffect, useState } from 'react';
import {
  FAN_PORTRAIT_ARROW_ATTR,
  FAN_PORTRAIT_BOARD_ATTR,
  FAN_PORTRAIT_SEAM_VAR
} from './fanLayout';

export type PortraitBoard = {
  boardBottom: number;
  arrow: { left: number; top: number; width: number; height: number };
};

export function usePortraitBoard(
  enabled: boolean,
  width: number,
  height: number
): PortraitBoard | null {
  const [portraitBoard, setPortraitBoard] = useState<PortraitBoard | null>(
    null
  );

  useLayoutEffect(() => {
    if (!enabled) {
      setPortraitBoard(null);
      return;
    }

    const board = document.querySelector<HTMLElement>(
      `[${FAN_PORTRAIT_BOARD_ATTR}]`
    );
    const arrow = document.querySelector<HTMLElement>(
      `[${FAN_PORTRAIT_ARROW_ATTR}]`
    );
    const arrowGrid = arrow?.parentElement;
    if (!board || !arrow || !arrowGrid) {
      setPortraitBoard(null);
      return;
    }

    const update = () => {
      const boardRect = board.getBoundingClientRect();
      const arrowRect = arrow.getBoundingClientRect();
      const boardBottom = arrowGrid.getBoundingClientRect().bottom;
      document.body.style.setProperty(
        FAN_PORTRAIT_SEAM_VAR,
        `${(boardRect.top + boardRect.bottom) / 2}px`
      );
      setPortraitBoard((previous) =>
        previous?.boardBottom === boardBottom &&
        previous.arrow.left === arrowRect.left &&
        previous.arrow.top === arrowRect.top &&
        previous.arrow.width === arrowRect.width &&
        previous.arrow.height === arrowRect.height
          ? previous
          : {
              boardBottom,
              arrow: {
                left: arrowRect.left,
                top: arrowRect.top,
                width: arrowRect.width,
                height: arrowRect.height
              }
            }
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(board);
    ro.observe(arrow);
    ro.observe(arrowGrid);
    return () => {
      ro.disconnect();
      document.body.style.removeProperty(FAN_PORTRAIT_SEAM_VAR);
    };
  }, [enabled, width, height]);

  return enabled ? portraitBoard : null;
}
