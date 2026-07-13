import { describe, expect, it } from 'vitest';
import { matchKeywords, normalizeKeyword, getKeywordEntry } from '../matcher';

describe('matchKeywords', () => {
  it('matches a keyword at the start of the string', () => {
    const matches = matchKeywords('Go again');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ id: 'go-again', start: 0, end: 8 });
  });

  it('matches case-insensitively and keeps the source casing in display', () => {
    const matches = matchKeywords('This attack has GO AGAIN.');
    expect(matches).toHaveLength(1);
    expect(matches[0].display).toBe('GO AGAIN');
    expect(matches[0].id).toBe('go-again');
  });

  it('captures the numeric parameter for parameterized keywords', () => {
    const matches = matchKeywords('Equipment with Arcane Barrier 2 helps.');
    expect(matches).toHaveLength(1);
    expect(matches[0].display).toBe('Arcane Barrier 2');
    expect(matches[0].id).toBe('arcane-barrier');
  });

  it('excludes a trailing number for non-parameterized keywords', () => {
    const matches = matchKeywords('Dominate 3');
    expect(matches).toHaveLength(1);
    expect(matches[0].display).toBe('Dominate');
  });

  it('does not match inside longer words', () => {
    expect(matchKeywords('The Wardens are here')).toHaveLength(0);
    expect(matchKeywords("Ward's power")).toHaveLength(0);
    expect(matchKeywords('Rewards')).toHaveLength(0);
  });

  it('matches keywords followed by punctuation', () => {
    const matches = matchKeywords('gains go again.');
    expect(matches).toHaveLength(1);
    expect(matches[0].display).toBe('go again');
  });

  it('does not auto-link noAutoLink entries', () => {
    expect(matchKeywords('Create a token')).toHaveLength(0);
    expect(matchKeywords('Destroy target aura')).toHaveLength(0);
  });

  it('finds multiple keywords with correct offsets', () => {
    const text = 'It has dominate and go again this turn.';
    const matches = matchKeywords(text);
    expect(matches.map((m) => m.id)).toEqual(['dominate', 'go-again']);
    for (const m of matches) {
      expect(text.slice(m.start, m.end)).toBe(m.display);
    }
  });

  it('resolves aliases to the canonical entry', () => {
    const matches = matchKeywords('The card is Frozen');
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('freeze');
  });

  it('returns an empty array for empty input', () => {
    expect(matchKeywords('')).toEqual([]);
  });
});

describe('normalizeKeyword', () => {
  it('resolves plain names', () => {
    expect(normalizeKeyword('Go again')).toBe('go-again');
    expect(normalizeKeyword('go   again')).toBe('go-again');
  });

  it('strips trailing integer parameters', () => {
    expect(normalizeKeyword('Ward 3')).toBe('ward');
    expect(normalizeKeyword('Arcane Barrier 2')).toBe('arcane-barrier');
  });

  it('resolves noAutoLink entries too', () => {
    expect(normalizeKeyword('Token')).toBe('token');
  });

  it('returns undefined for unknown strings', () => {
    expect(normalizeKeyword('Snapdragon Scalers')).toBeUndefined();
  });
});

describe('getKeywordEntry', () => {
  it('returns the entry for a valid id', () => {
    expect(getKeywordEntry('go-again')?.name).toBe('Go again');
  });

  it('returns undefined for an unknown id', () => {
    expect(getKeywordEntry('nope')).toBeUndefined();
  });
});
