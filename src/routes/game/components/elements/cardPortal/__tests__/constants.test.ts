import { describe, expect, it } from 'vitest';
import {
  getDoubleFacedCardNumber,
  getViseraiMarvelBackFaceImageId
} from '../constants';

describe('getDoubleFacedCardNumber', () => {
  it.each([
    ['viserai_the_forsaken', 'viserai_usurper'],
    ['viserai_between_worlds', 'viserai_usurper'],
    ['IAR106', 'IAR506'],
    ['IAR107', 'IAR506']
  ])('maps the %s front face to %s', (frontFace, backFace) => {
    expect(getDoubleFacedCardNumber(frontFace)).toBe(backFace);
  });

  it.each([
    ['viserai_usurper', 'viserai_the_forsaken'],
    ['viserai_usurper', 'viserai_between_worlds'],
    ['IAR506', 'IAR106'],
    ['IAR506', 'IAR107']
  ])(
    'maps the transformed %s face back to its original %s hero',
    (backFace, originalHero) => {
      expect(getDoubleFacedCardNumber(backFace, originalHero)).toBe(
        originalHero
      );
    }
  );

  it('keeps Levia Redeemed paired with Blasmophet, Levia Consumed', () => {
    expect(getDoubleFacedCardNumber('levia_redeemed')).toBe(
      'blasmophet_levia_consumed'
    );
    expect(
      getDoubleFacedCardNumber('blasmophet_levia_consumed')
    ).toBe('levia_redeemed');
  });

  it.each([
    [
      'viserai_the_forsaken',
      'IAR106-T',
      'IAR106-MV_BACK'
    ],
    [
      'viserai_between_worlds',
      'IAR107-T',
      'IAR107-MV_BACK'
    ],
    [
      'viserai_the_forsaken',
      'IAR106-MV',
      'IAR106-MV_BACK'
    ],
    [
      'viserai_between_worlds',
      'IAR107-MV',
      'IAR107-MV_BACK'
    ],
    [
      'IAR106',
      'IAR106-MV',
      'IAR106-MV_BACK'
    ],
    [
      'IAR107',
      'IAR107-MV',
      'IAR107-MV_BACK'
    ]
  ])(
    'uses the matching Marvel back image for %s with selected art %s',
    (hero, altArtPath, backFaceImage) => {
      expect(getViseraiMarvelBackFaceImageId(hero, altArtPath)).toBe(
        backFaceImage
      );
    }
  );

  it('does not use a Marvel back when the selected hero art is not Marvel', () => {
    expect(
      getViseraiMarvelBackFaceImageId('viserai_between_worlds', 'IAR107')
    ).toBeUndefined();
  });
});
