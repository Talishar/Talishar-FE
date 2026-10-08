export const ENABLE_FANNED_HAND_COOKIE = 'enableFannedHand';

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
};

export const FAN_REST_HIDDEN_RATIO = 0.54;
export const FAN_MAX_ROTATION_DEG = 12;
export const FAN_HOVER_SCALE = 1.725;
export const FAN_CARD_ART_ASPECT = 450 / 628;
export const FAN_MIN_HOVER_HEIGHT_PX = 300;
export const FAN_MAX_HOVER_SCREEN_RATIO = 0.75;
export const FAN_HOVER_HIT_RATIO = 0.7;
export const FAN_UNHOVER_ANCHOR_ATTR = 'data-fan-unhover-anchor';
export const FAN_HOVER_FALLBACK_RATIO = 0.8;
export const FAN_HOVER_MIN_BAND_RATIO = 0.6;
export const FAN_POINT_LIFT_RATIO = 0.12;
export const FAN_EXPAND_DELAY_MS = 500;
export const FAN_KEYWORD_DELAY_MS = 500;
export const FAN_LANDING_Z_INDEX = 999;

export const FAN_DROP_RATE = 32;
export const FAN_DROP_DURATION_S = 0.22;
export const FAN_RISE_RATE = 55;
export const FAN_RISE_DURATION_S = 0.07;
export const FAN_UNHOVER_RATE = 40;
export const FAN_UNHOVER_DURATION_S = 0.09;
export const FAN_LAND_DURATION_S = FAN_UNHOVER_DURATION_S;

function expEaseOut(rate: number, duration: number) {
  const k = rate * duration;
  return (progress: number) =>
    (1 - Math.exp(-k * progress)) / (1 - Math.exp(-k));
}

export const fanDropEase = expEaseOut(FAN_DROP_RATE, FAN_DROP_DURATION_S);
export const fanRiseEase = expEaseOut(FAN_RISE_RATE, FAN_RISE_DURATION_S);
export const fanUnhoverEase = expEaseOut(
  FAN_UNHOVER_RATE,
  FAN_UNHOVER_DURATION_S
);

export function fanHoverScaleFor(
  raw: string | undefined,
  cardHeight: number,
  screenHeight: number
): number {
  const size = Number(raw);
  const scale = Math.max(1, FAN_HOVER_SCALE * (size > 0 ? size : 1));
  if (cardHeight <= 0) return scale;
  const minHeight = Math.min(
    FAN_MIN_HOVER_HEIGHT_PX,
    screenHeight * FAN_MAX_HOVER_SCREEN_RATIO
  );
  return Math.max(scale, minHeight / cardHeight);
}

export function fanHoverLineY(
  stageBottom: number,
  cardHeight: number,
  hoverScale: number,
  anchorY: number | null
): number {
  const highest = stageBottom - cardHeight * hoverScale * FAN_HOVER_HIT_RATIO;
  const lowest = stageBottom - cardHeight * FAN_HOVER_MIN_BAND_RATIO;
  const target = anchorY ?? stageBottom - cardHeight * FAN_HOVER_FALLBACK_RATIO;
  return Math.min(lowest, Math.max(highest, target));
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

export function fanIndexAt(
  slots: FanSlot[],
  x: number,
  cardWidth: number
): number | null {
  if (slots.length === 0) return null;
  if (x < slots[0].x - cardWidth / 2) return null;
  if (x > slots[slots.length - 1].x + cardWidth / 2) return null;
  let index = 0;
  slots.forEach((slot, i) => {
    if (x >= slot.x - cardWidth / 2) index = i;
  });
  return index;
}

export function fanSlotIndexAt(
  count: number,
  x: number,
  g: FanGeometry
): number {
  if (count <= 1) return 0;
  const spacing = fanSpacing(count, g);
  const index = Math.round(x / spacing + (count - 1) / 2);
  return Math.min(count - 1, Math.max(0, index));
}

export function fanHoverIndexAt(
  count: number,
  x: number,
  g: FanGeometry,
  hoveredIndex: number | null,
  hoverScale = FAN_HOVER_SCALE,
  expanded = true
): number | null {
  const slots = computeFanSlots(count, g);
  const index = fanIndexAt(slots, x, g.cardWidth * fanScaleFor(count));
  if (index !== null || hoveredIndex === null || !slots[hoveredIndex]) {
    return index;
  }
  if (!expanded) return null;
  const hovered = applyFanHover(slots, hoveredIndex, g, hoverScale, expanded)[
    hoveredIndex
  ];
  return Math.abs(x - hovered.x) <= (g.cardWidth * hoverScale) / 2
    ? hoveredIndex
    : null;
}

export function applyFanHover(
  slots: FanSlot[],
  hoveredIndex: number | null,
  g: FanGeometry,
  hoverScale = FAN_HOVER_SCALE,
  expanded = true
): FanSlot[] {
  if (hoveredIndex === null || !slots[hoveredIndex]) return slots;
  const maxX = Math.max(0, (g.stageWidth - g.cardWidth * hoverScale) / 2);
  const artGap = Math.max(0, g.cardHeight - g.cardWidth / FAN_CARD_ART_ASPECT);
  return slots.map((slot, i) => {
    if (i !== hoveredIndex) return slot;
    if (!expanded) {
      return {
        ...slot,
        y: slot.y - FAN_POINT_LIFT_RATIO * g.cardHeight,
        zIndex: 1000
      };
    }
    return {
      x: Math.max(-maxX, Math.min(maxX, slot.x)),
      y: (-(hoverScale - 1) * g.cardHeight) / 2 + hoverScale * artGap,
      rotate: 0,
      scale: hoverScale,
      zIndex: 1000
    };
  });
}
