import { describe, expect, it } from 'vitest';
import { parseHeroNames, shortenHeroNames } from './gameDescription';

describe('hero names in game descriptions', () => {
  it('shortens only a first name that is unique in the format', () => {
    const legal = [
      'Kayo Underhanded Cheat',
      'Bravo Showstopper',
      'Bravo Star of the Show'
    ];
    expect(
      shortenHeroNames(
        'Kayo Underhanded Cheat, Bravo Showstopper',
        legal
      )
    ).toBe('Kayo, Bravo Showstopper');
  });

  it('keeps comma-bearing hero names distinct and preserves variants', () => {
    const legal = [
      'Dr. Mortimer, Blight of the Pits',
      'Min, Genius',
      'Min, Mad',
      'Oscilio, Forked Continuum'
    ];
    const names =
      'Dr. Mortimer, Blight of the Pits, Min, Genius, Oscilio, Forked Continuum (Combo)';
    expect(parseHeroNames(names, legal)).toEqual([
      'Dr. Mortimer, Blight of the Pits',
      'Min, Genius',
      'Oscilio, Forked Continuum (Combo)'
    ]);
    expect(shortenHeroNames(names, legal)).toBe(
      'Dr. Mortimer, Min, Genius, Oscilio (Combo)'
    );
  });
});
