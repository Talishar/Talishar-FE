import { describe, it, expect } from 'vitest';
import {
  classifyDragRelease,
  isAbovePlayLine,
  isClickMove,
  playDragDistance
} from './playLine';

const viewportHeight = 1000;

describe('classifyDragRelease', () => {
  it('never plays on a downward drag, even past the old threshold', () => {
    expect(
      classifyDragRelease({
        pointerY: 600,
        offsetX: 0,
        offsetY: 400,
        viewportHeight
      })
    ).toBe('none');
  });

  it('plays when dragged up past 37.5% of a viewport taller than 800px', () => {
    expect(playDragDistance(viewportHeight)).toBe(375);
    expect(isAbovePlayLine(-376, viewportHeight)).toBe(true);
    expect(
      classifyDragRelease({
        pointerY: 400,
        offsetX: 20,
        offsetY: -376,
        viewportHeight
      })
    ).toBe('play');
  });

  it('does not play an upward drag shorter than the play distance', () => {
    expect(isAbovePlayLine(-375, viewportHeight)).toBe(false);
    expect(
      classifyDragRelease({
        pointerY: 500,
        offsetX: 0,
        offsetY: -300,
        viewportHeight
      })
    ).toBe('none');
  });

  it('uses 25% of the viewport when it is 800px tall or less', () => {
    expect(playDragDistance(800)).toBe(200);
    expect(isAbovePlayLine(-199, 800)).toBe(false);
    expect(isAbovePlayLine(-201, 800)).toBe(true);
  });

  it('cancels a downward release in the bottom 5% of the viewport', () => {
    expect(
      classifyDragRelease({
        pointerY: 970,
        offsetX: 10,
        offsetY: 120,
        viewportHeight
      })
    ).toBe('cancel');
  });

  it('reorders a horizontal drag released in the bottom 5%', () => {
    expect(
      classifyDragRelease({
        pointerY: 970,
        offsetX: 200,
        offsetY: 10,
        viewportHeight
      })
    ).toBe('reorder');
  });

  it('reorders on a mostly horizontal drag', () => {
    expect(
      classifyDragRelease({
        pointerY: 900,
        offsetX: -120,
        offsetY: -20,
        viewportHeight
      })
    ).toBe('reorder');
  });
});

describe('isClickMove', () => {
  const cardHeight = 254;

  it('treats movement under 5% of the card height as a click', () => {
    expect(isClickMove(0, 0, cardHeight)).toBe(true);
    expect(isClickMove(5, 0, cardHeight)).toBe(true);
    expect(isClickMove(0, -12, cardHeight)).toBe(true);
  });

  it('treats movement of 5% of the card height or more as a drag', () => {
    expect(isClickMove(13, 0, cardHeight)).toBe(false);
    expect(isClickMove(9, 9, cardHeight)).toBe(false);
  });
});
