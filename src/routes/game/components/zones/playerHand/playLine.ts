export const PLAY_DRAG_RATIO = 0.25;
export const TALL_VIEWPORT_PX = 800;
export const TALL_VIEWPORT_PLAY_MULTIPLIER = 1.5;
export const TOUCH_PICKUP_PLAY_DRAG_RATIO = 0.125;

export type DragRelease = 'play' | 'return';

export function playDragDistance(
  viewportHeight: number,
  touchPickup = false
): number {
  if (touchPickup) return viewportHeight * TOUCH_PICKUP_PLAY_DRAG_RATIO;
  const distance = viewportHeight * PLAY_DRAG_RATIO;
  return viewportHeight > TALL_VIEWPORT_PX
    ? distance * TALL_VIEWPORT_PLAY_MULTIPLIER
    : distance;
}

export function isAbovePlayLine(
  offsetY: number,
  viewportHeight: number,
  touchPickup = false
): boolean {
  return -offsetY > playDragDistance(viewportHeight, touchPickup);
}

export function classifyDragRelease(a: {
  offsetY: number;
  viewportHeight: number;
  touchPickup?: boolean;
}): DragRelease {
  return isAbovePlayLine(a.offsetY, a.viewportHeight, a.touchPickup)
    ? 'play'
    : 'return';
}

export const CLICK_MOVE_TOLERANCE_RATIO = 0.05;

export function isClickMove(
  offsetX: number,
  offsetY: number,
  cardHeight: number
): boolean {
  return Math.hypot(offsetX, offsetY) < cardHeight * CLICK_MOVE_TOLERANCE_RATIO;
}
