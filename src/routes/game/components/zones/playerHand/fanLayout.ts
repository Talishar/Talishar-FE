export const DISABLE_FANNED_HAND_COOKIE = 'disableFannedHand';

export type FanSlot = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
};

export type FanGeometry = {
  stageWidth: number;
  cardWidth: number;
  cardHeight: number;
  viewportHeight: number;
};

export const FAN_REST_HIDDEN_RATIO = 0.58;
export const FAN_MAX_ROTATION_DEG = 12;
export const HOVER_PUSH_PX = [75, 50, 25];
export const HOVER_HAND_LIFT_RATIO = 0.35;
export const HOVER_NEAR_LIFT_RATIO = [0.2, 0.13, 0.07];
export const FAN_HOVER_SCALE = 1.725;
export const FAN_HOVER_HIT_RATIO = 0.7;

export const FAN_DROP_RATE = 32;
export const FAN_DROP_DURATION_S = 0.22;

export function fanDropEase(progress: number): number {
  const k = FAN_DROP_RATE * FAN_DROP_DURATION_S;
  return (1 - Math.exp(-k * progress)) / (1 - Math.exp(-k));
}

export function fanHoverScaleFor(raw: string | undefined): number {
  const size = Number(raw);
  return Math.max(1, FAN_HOVER_SCALE * (size > 0 ? size : 1));
}

export function fanScaleFor(count: number): number {
  if (count <= 8) return 1;
  if (count === 9) return 0.95;
  if (count === 10) return 0.9;
  return 0.85;
}

export function fanSpacing(count: number, g: FanGeometry): number {
  if (count <= 1) return 0;
  const scale = fanScaleFor(count);
  const spacing = Math.min(
    g.cardWidth * 0.9 * scale,
    (g.stageWidth - g.cardWidth * scale) / (count - 1)
  );
  return Math.max(spacing, g.cardWidth * 0.2);
}

export function computeFanSlots(count: number, g: FanGeometry): FanSlot[] {
  const spacing = fanSpacing(count, g);
  const scale = fanScaleFor(count);
  const mid = (count - 1) / 2;
  const maxRotation = Math.min(FAN_MAX_ROTATION_DEG, 2.5 * (count - 1));
  const arcDepth = g.cardHeight * 0.005 * maxRotation;
  const slots: FanSlot[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i - mid) / Math.max(1, mid);
    slots.push({
      x: (i - mid) * spacing,
      y: g.cardHeight * FAN_REST_HIDDEN_RATIO + t * t * arcDepth,
      rotate: t * maxRotation,
      scale,
      zIndex: 200 + i
    });
  }
  return slots;
}

export function applyFanHover(
  slots: FanSlot[],
  hoveredIndex: number | null,
  g: FanGeometry,
  hoverScale = FAN_HOVER_SCALE
): FanSlot[] {
  if (hoveredIndex === null || !slots[hoveredIndex]) return slots;
  const maxX = Math.max(0, (g.stageWidth - g.cardWidth * hoverScale) / 2);
  const pushScale = g.viewportHeight / 1080;
  return slots.map((slot, i) => {
    if (i === hoveredIndex) {
      return {
        x: Math.max(-maxX, Math.min(maxX, slot.x)),
        y: (-(hoverScale - 1) * g.cardHeight) / 2,
        rotate: 0,
        scale: hoverScale,
        zIndex: 1000
      };
    }
    const distance = Math.abs(i - hoveredIndex);
    const direction = Math.sign(i - hoveredIndex);
    const push = HOVER_PUSH_PX[distance - 1] ?? 0;
    const lift =
      HOVER_HAND_LIFT_RATIO + (HOVER_NEAR_LIFT_RATIO[distance - 1] ?? 0);
    return {
      ...slot,
      x: slot.x + direction * push * pushScale,
      y: slot.y - lift * g.cardHeight
    };
  });
}
