import { describe, expect, it } from 'vitest';
import {
  FAN_HOVER_SCALE,
  FAN_POINT_LIFT_RATIO,
  applyFanHover,
  computeFanSlots
} from '../fanLayout';

const geometry = { stageWidth: 1400, cardWidth: 180, cardHeight: 270 };

describe('applyFanHover', () => {
  const slots = computeFanSlots(5, geometry);

  it('only lifts the pointed card a little until it expands', () => {
    const pointed = applyFanHover(slots, 2, geometry, FAN_HOVER_SCALE, false);
    expect(pointed[2]).toEqual({
      ...slots[2],
      y: slots[2].y - FAN_POINT_LIFT_RATIO * geometry.cardHeight
    });
  });

  it('enlarges the hovered card once it expands', () => {
    const expanded = applyFanHover(slots, 2, geometry, FAN_HOVER_SCALE, true);
    expect(expanded[2].scale).toBe(FAN_HOVER_SCALE);
    expect(expanded[2].rotate).toBe(0);
    expect(expanded[2].zIndex).toBe(1000);
  });

  it('leaves the other cards alone', () => {
    for (const expanded of [false, true]) {
      const hovered = applyFanHover(
        slots,
        2,
        geometry,
        FAN_HOVER_SCALE,
        expanded
      );
      [0, 1, 3, 4].forEach((i) => expect(hovered[i]).toBe(slots[i]));
    }
  });

  it('changes nothing when no card is hovered', () => {
    expect(applyFanHover(slots, null, geometry)).toBe(slots);
  });
});
