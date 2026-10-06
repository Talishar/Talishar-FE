import { describe, it, expect } from 'vitest';
import {
  FAN_HOVER_SCALE,
  FAN_MAX_ROTATION_DEG,
  FanGeometry,
  HOVER_HAND_LIFT_RATIO,
  HOVER_NEAR_LIFT_RATIO,
  HOVER_PUSH_PX,
  applyFanHover,
  computeFanSlots,
  fanHoverScaleFor,
  fanScaleFor
} from './fanLayout';

const geometry = (stageWidth: number, viewportHeight = 1080): FanGeometry => {
  const cardHeight = viewportHeight * 0.25;
  return {
    stageWidth,
    cardHeight,
    cardWidth: (cardHeight * 2) / 3,
    viewportHeight
  };
};

describe('computeFanSlots', () => {
  it('is symmetric in x and rotation', () => {
    const slots = computeFanSlots(7, geometry(1400));
    for (let i = 0; i < slots.length; i++) {
      const mirror = slots[slots.length - 1 - i];
      expect(slots[i].x).toBeCloseTo(-mirror.x);
      expect(slots[i].rotate).toBeCloseTo(-mirror.rotate);
      expect(slots[i].y).toBeCloseTo(mirror.y);
    }
  });

  it('never rotates beyond FAN_MAX_ROTATION_DEG', () => {
    for (let n = 1; n <= 20; n++) {
      for (const slot of computeFanSlots(n, geometry(1400))) {
        expect(Math.abs(slot.rotate)).toBeLessThanOrEqual(FAN_MAX_ROTATION_DEG);
      }
    }
  });

  it('steps the scale down from nine cards', () => {
    expect(fanScaleFor(8)).toBe(1);
    expect(fanScaleFor(9)).toBe(0.95);
    expect(fanScaleFor(10)).toBe(0.9);
    expect(fanScaleFor(11)).toBe(0.85);
    expect(fanScaleFor(15)).toBe(0.85);
  });

  it('keeps a 15-card fan within a 1400px stage', () => {
    const g = geometry(1400);
    const slots = computeFanSlots(15, g);
    const halfCard = (g.cardWidth * slots[0].scale) / 2;
    const left = slots[0].x - halfCard;
    const right = slots[slots.length - 1].x + halfCard;
    expect(right - left).toBeLessThanOrEqual(1400);
  });

  it('places a single card upright at the centre', () => {
    const [slot] = computeFanSlots(1, geometry(1400));
    expect(slot.x).toBe(0);
    expect(slot.rotate).toBe(0);
  });
});

describe('fanHoverScaleFor', () => {
  it('falls back to the default scale for a missing or invalid size', () => {
    for (const raw of [undefined, '', 'abc', '0', '-1']) {
      expect(fanHoverScaleFor(raw)).toBe(FAN_HOVER_SCALE);
    }
  });

  it('multiplies the default scale by the preview size', () => {
    expect(fanHoverScaleFor('1.25')).toBeCloseTo(2.15625);
    expect(fanHoverScaleFor('0.75')).toBeCloseTo(1.29375);
  });

  it('never shrinks the hovered card below its resting size', () => {
    expect(fanHoverScaleFor('0.5')).toBe(1);
  });
});

describe('applyFanHover', () => {
  it('returns the input unchanged without a hovered card', () => {
    const slots = computeFanSlots(5, geometry(1400));
    expect(applyFanHover(slots, null, geometry(1400))).toBe(slots);
  });

  it('lifts the hovered card upright and pushes neighbours by 75/50/25 at 1080p', () => {
    const g = geometry(1600);
    const slots = computeFanSlots(9, g);
    const hovered = applyFanHover(slots, 4, g);

    expect(hovered[4]).toMatchObject({
      rotate: 0,
      scale: FAN_HOVER_SCALE,
      zIndex: 1000
    });
    expect(hovered[4].y + (g.cardHeight * FAN_HOVER_SCALE) / 2).toBeCloseTo(
      g.cardHeight / 2
    );
    for (let d = 1; d <= 3; d++) {
      expect(hovered[4 + d].x - slots[4 + d].x).toBeCloseTo(
        HOVER_PUSH_PX[d - 1]
      );
      expect(hovered[4 - d].x - slots[4 - d].x).toBeCloseTo(
        -HOVER_PUSH_PX[d - 1]
      );
    }
    expect(hovered[0].x).toBe(slots[0].x);
    expect(hovered[8].x).toBe(slots[8].x);
  });

  it('lifts the whole hand, more for cards nearer the hovered one', () => {
    const g = geometry(1600);
    const slots = computeFanSlots(9, g);
    const hovered = applyFanHover(slots, 4, g);

    for (let d = 1; d <= 3; d++) {
      const lift =
        (HOVER_HAND_LIFT_RATIO + HOVER_NEAR_LIFT_RATIO[d - 1]) * g.cardHeight;
      expect(slots[4 + d].y - hovered[4 + d].y).toBeCloseTo(lift);
      expect(slots[4 - d].y - hovered[4 - d].y).toBeCloseTo(lift);
    }
    expect(slots[0].y - hovered[0].y).toBeCloseTo(
      HOVER_HAND_LIFT_RATIO * g.cardHeight
    );
    expect(slots[8].y - hovered[8].y).toBeCloseTo(
      HOVER_HAND_LIFT_RATIO * g.cardHeight
    );
    expect(hovered[3].rotate).toBe(slots[3].rotate);
    expect(hovered[3].scale).toBe(slots[3].scale);
  });

  it('keeps the hovered edge card of a 12-card fan inside the stage', () => {
    const g = geometry(1000);
    const slots = computeFanSlots(12, g);
    for (const index of [0, 11]) {
      const hovered = applyFanHover(slots, index, g)[index];
      expect(
        Math.abs(hovered.x) + (g.cardWidth * FAN_HOVER_SCALE) / 2
      ).toBeLessThanOrEqual(g.stageWidth / 2 + 1e-9);
    }
  });

  it('uses a custom hover scale for the lift and the edge clamp', () => {
    const g = geometry(1600);
    const slots = computeFanSlots(9, g);
    const hovered = applyFanHover(slots, 4, g, 1.875)[4];
    expect(hovered.scale).toBe(1.875);
    expect(hovered.y + (g.cardHeight * 1.875) / 2).toBeCloseTo(
      g.cardHeight / 2
    );

    const edge = geometry(1000);
    const edgeSlots = computeFanSlots(12, edge);
    for (const index of [0, 11]) {
      const lifted = applyFanHover(edgeSlots, index, edge, 1.875)[index];
      expect(
        Math.abs(lifted.x) + (edge.cardWidth * 1.875) / 2
      ).toBeLessThanOrEqual(edge.stageWidth / 2 + 1e-9);
    }
  });
});
