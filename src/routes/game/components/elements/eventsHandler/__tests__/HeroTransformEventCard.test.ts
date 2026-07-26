import { describe, expect, it } from 'vitest';
import { getHeroTransformTheme } from '../HeroTransformEventCard';

describe('getHeroTransformTheme', () => {
  it.each([
    ['teklovossen_the_mechropotent', 'mechanologist'],
    ['EVO010', 'mechanologist'],
    ['EVO410a', 'mechanologist'],
    ['levia_redeemed', 'shadow'],
    ['DTD164', 'shadow'],
    ['DTD564', 'shadow'],
    ['arakni_marionette', 'chaos'],
    ['arakni_black_widow', 'chaos'],
    ['HNT003', 'chaos']
  ] as const)('maps %s to the %s presentation', (cardNumber, theme) => {
    expect(getHeroTransformTheme(cardNumber)).toBe(theme);
  });
});
