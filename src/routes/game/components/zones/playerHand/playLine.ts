export const PLAY_DRAG_RATIO = 0.25;
export const TALL_VIEWPORT_PX = 800;
export const TALL_VIEWPORT_PLAY_MULTIPLIER = 1.5;
export const CANCEL_ZONE_RATIO = 0.95;

export type DragRelease = 'play' | 'reorder' | 'cancel' | 'none';

export function playDragDistance(viewportHeight: number): number {
  const distance = viewportHeight * PLAY_DRAG_RATIO;
  return viewportHeight > TALL_VIEWPORT_PX
    ? distance * TALL_VIEWPORT_PLAY_MULTIPLIER
    : distance;
}

export function isAbovePlayLine(
  offsetY: number,
  viewportHeight: number
): boolean {
  return -offsetY > playDragDistance(viewportHeight);
}

export function classifyDragRelease(a: {
  pointerY: number;
  offsetX: number;
  offsetY: number;
  viewportHeight: number;
}): DragRelease {
  if (isAbovePlayLine(a.offsetY, a.viewportHeight)) return 'play';
  const absX = Math.abs(a.offsetX);
  if (absX > 8 && absX > Math.abs(a.offsetY)) return 'reorder';
  if (a.pointerY > a.viewportHeight * CANCEL_ZONE_RATIO) return 'cancel';
  return 'none';
}
