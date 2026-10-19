export const ENABLE_FANNED_HAND_COOKIE = 'enableFannedHand';

export type FanSlot = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  width?: number;
  height?: number;
};

export type FanGeometry = {
  stageWidth: number;
  cardWidth: number;
  cardHeight: number;
  mobile?: boolean;
  hoverLift?: boolean;
  hiddenRatio?: number;
  spread?: boolean;
};

export const FAN_REST_HIDDEN_RATIO = 0.54;
export const FAN_MAX_ROTATION_DEG = 12;
export const FAN_MOBILE_MAX_ROTATION_DEG = 3;
export const FAN_HOVER_SCALE = 1.725;
export const FAN_CARD_ART_ASPECT = 450 / 628;
export const FAN_WIDE_HOVER_RATIO = 1 / FAN_CARD_ART_ASPECT ** 2;
export const FAN_MIN_HOVER_HEIGHT_PX = 300;
export const FAN_MAX_HOVER_SCREEN_RATIO = 0.75;
export const FAN_HOVER_HIT_RATIO = 0.7;
export const FAN_UNHOVER_ANCHOR_ATTR = 'data-fan-unhover-anchor';
export const FAN_HOVER_FALLBACK_RATIO = 0.8;
export const FAN_HOVER_MIN_BAND_RATIO = 0.6;
export const FAN_MOUSE_LINE_DROP_RATIO = 0.07;
export const FAN_POINT_LIFT_RATIO = 0.12;
export const FAN_MIN_STEP_RATIO = 0.2;
export const FAN_STEP_RATIO = 0.9;
export const FAN_MOBILE_STEP_RATIO = 1;
export const FAN_MOBILE_HOVER_LIFT_RATIO = 0.24;
export const FAN_EXPAND_DELAY_MS = 500;
export const FAN_KEYWORD_DELAY_MS = 500;
export const FAN_LANDING_Z_INDEX = 999;
export const FAN_CARD_HEIGHT_RATIO = 0.25;
export const FAN_LANDSCAPE_CARD_HEIGHT_RATIO = 0.35;
export const FAN_LANDSCAPE_BODY_CLASS = 'fanLandscapeHand';
export const FAN_HAND_RESERVE_VAR = '--fan-hand-reserve';
export const FAN_FULLSCREEN_WIDTH_VAR = '--fan-fullscreen-width';
export const FAN_WINDOW_VH_VAR = '--fan-window-vh';
export const FAN_WINDOW_VH = `var(${FAN_WINDOW_VH_VAR}, 1dvh)`;
export const FAN_SIDE_COLUMN_ATTR = 'data-fan-side-column';
export const FAN_DOCK_CARD_HEIGHT_RATIO = 0.4;
export const FAN_DOCK_HIDDEN_RATIO = 0.3;
export const FAN_OPEN_CARD_HEIGHT_RATIO = 0.42;
export const FAN_OPEN_HIDDEN_RATIO = 0.14;
export const FAN_DOCK_EDGE_GAP_PX = 4;
export const FAN_DOCK_OPEN_GUARD_MS = 300;
export const FAN_DOCK_START_ATTR = 'data-fan-dock-start';
export const FAN_KEEP_OPEN_ATTR = 'data-fan-keep-open';

export const FAN_DROP_FAST_RATE = 160;
export const FAN_DROP_SLOW_RATE = 21;
export const FAN_DROP_FAST_SHARE = 0.49;
export const FAN_DROP_DURATION_S = 0.25;
export const FAN_RISE_FAST_RATE = 114;
export const FAN_RISE_SLOW_RATE = 26;
export const FAN_RISE_FAST_SHARE = 0.63;
export const FAN_RISE_DURATION_S = 0.16;
export const FAN_UNHOVER_DURATION_S = 0.27;
export const FAN_LAND_DURATION_S = FAN_UNHOVER_DURATION_S;
export const FAN_DOCK_RATE = 37;
export const FAN_DOCK_DURATION_S = 0.22;
export const FAN_SPREAD_RATIOS = [0.4, 0.27, 0.13];
export const FAN_SPREAD_RATE = 7.4;
export const FAN_SPREAD_DURATION_S = 0.62;
export const FAN_SWITCH_RISE_RATE = 18;
export const FAN_SWITCH_RISE_DURATION_S = 0.26;
export const FAN_SWITCH_LAND_DURATION_S = FAN_SPREAD_DURATION_S;

function expEaseOut(rate: number, duration: number) {
  const k = rate * duration;
  return (progress: number) =>
    (1 - Math.exp(-k * progress)) / (1 - Math.exp(-k));
}

function twoRateEaseOut(
  fastRate: number,
  slowRate: number,
  fastShare: number,
  duration: number
) {
  const at = (t: number) =>
    fastShare * (1 - Math.exp(-fastRate * t)) +
    (1 - fastShare) * (1 - Math.exp(-slowRate * t));
  const end = at(duration);
  return (progress: number) => at(progress * duration) / end;
}

export const fanDropEase = twoRateEaseOut(
  FAN_DROP_FAST_RATE,
  FAN_DROP_SLOW_RATE,
  FAN_DROP_FAST_SHARE,
  FAN_DROP_DURATION_S
);
export const fanRiseEase = twoRateEaseOut(
  FAN_RISE_FAST_RATE,
  FAN_RISE_SLOW_RATE,
  FAN_RISE_FAST_SHARE,
  FAN_RISE_DURATION_S
);
export const fanDockEase = expEaseOut(FAN_DOCK_RATE, FAN_DOCK_DURATION_S);
export const fanSpreadEase = expEaseOut(FAN_SPREAD_RATE, FAN_SPREAD_DURATION_S);
export const fanSwitchRiseEase = expEaseOut(
  FAN_SWITCH_RISE_RATE,
  FAN_SWITCH_RISE_DURATION_S
);
export const fanUnhoverEase = (progress: number) => 1 - (1 - progress) ** 2;

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
  anchorY: number | null,
  dropRatio = 0
): number {
  const hoverHeight = cardHeight * hoverScale;
  const highest = stageBottom - hoverHeight * FAN_HOVER_HIT_RATIO;
  const lowest = stageBottom - cardHeight * FAN_HOVER_MIN_BAND_RATIO;
  const target = anchorY ?? stageBottom - cardHeight * FAN_HOVER_FALLBACK_RATIO;
  return Math.min(lowest, Math.max(highest, target) + hoverHeight * dropRatio);
}

function fanMinScaleFor(count: number): number {
  if (count <= 8) return 1;
  if (count === 9) return 0.95;
  if (count === 10) return 0.9;
  return 0.85;
}

export function fanScaleFor(count: number, g: FanGeometry): number {
  const minScale = fanMinScaleFor(count);
  if (minScale === 1 || g.cardWidth <= 0) return minScale;
  const fitScale =
    (g.stageWidth - g.cardWidth * FAN_MIN_STEP_RATIO * (count - 1)) /
    g.cardWidth;
  return Math.min(1, Math.max(minScale, fitScale));
}

export function fanSpacing(count: number, g: FanGeometry): number {
  if (count <= 1) return 0;
  const scale = fanScaleFor(count, g);
  const stepRatio = g.mobile ? FAN_MOBILE_STEP_RATIO : FAN_STEP_RATIO;
  const spacing = Math.min(
    g.cardWidth * stepRatio * scale,
    (g.stageWidth - g.cardWidth * scale) / (count - 1)
  );
  return Math.max(spacing, g.cardWidth * FAN_MIN_STEP_RATIO);
}

export function computeFanSlots(count: number, g: FanGeometry): FanSlot[] {
  const spacing = fanSpacing(count, g);
  const scale = fanScaleFor(count, g);
  const mid = (count - 1) / 2;
  const maxRotation = Math.min(
    g.mobile ? FAN_MOBILE_MAX_ROTATION_DEG : FAN_MAX_ROTATION_DEG,
    2.5 * (count - 1)
  );
  const arcDepth = g.cardHeight * 0.005 * maxRotation;
  const slots: FanSlot[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i - mid) / Math.max(1, mid);
    slots.push({
      x: (i - mid) * spacing,
      y:
        g.cardHeight * (g.hiddenRatio ?? FAN_REST_HIDDEN_RATIO) +
        t * t * arcDepth,
      rotate: t * maxRotation,
      scale,
      zIndex: 200 + (g.mobile ? count - 1 - i : i)
    });
  }
  return slots;
}

export function fanIndexAt(
  slots: FanSlot[],
  x: number,
  cardWidth: number
): number | null {
  let top: number | null = null;
  for (let i = 0; i < slots.length; i++) {
    if (Math.abs(x - slots[i].x) > cardWidth / 2) continue;
    if (top === null || slots[i].zIndex > slots[top].zIndex) top = i;
  }
  return top;
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

export function fanHoverWidth(
  g: FanGeometry,
  hoverScale: number,
  wide: boolean
): number {
  const width = g.cardWidth * hoverScale;
  if (!wide) return width;
  const wideWidth = width * FAN_WIDE_HOVER_RATIO;
  return g.stageWidth > 0 ? Math.min(wideWidth, g.stageWidth) : wideWidth;
}

export function fanSpreadSlots(
  slots: FanSlot[],
  hoveredIndex: number | null,
  g: FanGeometry
): FanSlot[] {
  if (!g.spread || hoveredIndex === null || !slots[hoveredIndex]) return slots;
  return slots.map((slot, i) => {
    if (i === hoveredIndex) return slot;
    const d = Math.abs(i - hoveredIndex);
    return {
      ...slot,
      x:
        slot.x +
        Math.sign(i - hoveredIndex) *
          (FAN_SPREAD_RATIOS[d - 1] ?? 0) *
          g.cardWidth *
          slot.scale
    };
  });
}

export function fanHoverIndexAt(
  count: number,
  x: number,
  g: FanGeometry,
  hoveredIndex: number | null,
  hoverScale = FAN_HOVER_SCALE,
  expanded = true,
  wide = false
): number | null {
  const slots = computeFanSlots(count, g);
  const hitSlots =
    expanded && hoveredIndex !== null && slots[hoveredIndex]
      ? fanSpreadSlots(slots, hoveredIndex, g)
      : slots;
  const index = fanIndexAt(hitSlots, x, g.cardWidth * fanScaleFor(count, g));
  if (index !== null || hoveredIndex === null || !slots[hoveredIndex]) {
    return index;
  }
  if (!expanded) return null;
  const hovered = applyFanHover(
    slots,
    hoveredIndex,
    g,
    hoverScale,
    expanded,
    wide
  )[hoveredIndex];
  return Math.abs(x - hovered.x) <= fanHoverWidth(g, hoverScale, wide) / 2
    ? hoveredIndex
    : null;
}

export function applyFanHover(
  slots: FanSlot[],
  hoveredIndex: number | null,
  g: FanGeometry,
  hoverScale = FAN_HOVER_SCALE,
  expanded = true,
  wide = false
): FanSlot[] {
  if (hoveredIndex === null || !slots[hoveredIndex]) return slots;
  const hoverWidth = fanHoverWidth(g, hoverScale, wide);
  const maxX = Math.max(0, (g.stageWidth - hoverWidth) / 2);
  const artGap = Math.max(0, g.cardHeight - g.cardWidth / FAN_CARD_ART_ASPECT);
  const lift = g.hoverLift
    ? FAN_MOBILE_HOVER_LIFT_RATIO * hoverScale * g.cardHeight
    : 0;
  const spread = expanded ? fanSpreadSlots(slots, hoveredIndex, g) : slots;
  return slots.map((slot, i) => {
    if (i !== hoveredIndex) return spread[i];
    if (!expanded) {
      return {
        ...slot,
        y: slot.y - FAN_POINT_LIFT_RATIO * g.cardHeight,
        zIndex: 1000
      };
    }
    return {
      x: Math.max(-maxX, Math.min(maxX, slot.x)),
      y: (-(hoverScale - 1) * g.cardHeight) / 2 + hoverScale * artGap - lift,
      rotate: 0,
      scale: hoverScale,
      zIndex: 1000,
      ...(wide && {
        width: hoverWidth,
        height: hoverWidth * FAN_CARD_ART_ASPECT + hoverScale * artGap
      })
    };
  });
}
