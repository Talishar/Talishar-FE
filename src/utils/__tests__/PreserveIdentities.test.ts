import { describe, it, expect } from 'vitest';
import { preserveIdentities } from '../PreserveIdentities';

describe('preserveIdentities', () => {
  it('returns prev when deeply equal', () => {
    const prev = { a: 1, b: [{ c: 'x' }, { c: 'y' }] };
    const next = { a: 1, b: [{ c: 'x' }, { c: 'y' }] };
    expect(preserveIdentities(prev, next)).toBe(prev);
  });

  it('returns next values for changed fields but keeps unchanged children', () => {
    const prev = { hand: [{ cardNumber: 'a' }, { cardNumber: 'b' }], hp: 20 };
    const next = { hand: [{ cardNumber: 'a' }, { cardNumber: 'b' }], hp: 19 };
    const result = preserveIdentities(prev, next);
    expect(result).not.toBe(prev);
    expect(result.hp).toBe(19);
    // unchanged array keeps its previous identity
    expect(result.hand).toBe(prev.hand);
  });

  it('keeps unchanged elements when an array grows', () => {
    const prev = [{ cardNumber: 'a' }, { cardNumber: 'b' }];
    const next = [{ cardNumber: 'a' }, { cardNumber: 'b' }, { cardNumber: 'c' }];
    const result = preserveIdentities(prev, next);
    expect(result).not.toBe(prev);
    expect(result[0]).toBe(prev[0]);
    expect(result[1]).toBe(prev[1]);
    expect(result[2]).toEqual({ cardNumber: 'c' });
  });

  it('detects removed keys', () => {
    const prev = { a: 1, b: 2 };
    const next = { a: 1 } as typeof prev;
    expect(preserveIdentities(prev, next)).toEqual({ a: 1 });
  });

  it('detects replaced keys with same count', () => {
    const prev: Record<string, number> = { a: 1 };
    const next: Record<string, number> = { b: 1 };
    expect(preserveIdentities(prev, next)).toEqual({ b: 1 });
  });

  it('handles undefined and null', () => {
    expect(preserveIdentities(undefined, [1])).toEqual([1]);
    expect(preserveIdentities([1], null as unknown as number[])).toBeNull();
    expect(preserveIdentities(null as unknown as number[], [1])).toEqual([1]);
  });

  it('does not confuse arrays and objects', () => {
    const prev = { 0: 'a' };
    const next = ['a'] as unknown as typeof prev;
    expect(preserveIdentities(prev, next)).toBe(next);
  });

  it('preserves deep nested identity inside changed parents', () => {
    const prev = {
      playerOne: { Hand: [{ cardNumber: 'a' }], Graveyard: [{ cardNumber: 'g' }] }
    };
    const next = {
      playerOne: { Hand: [{ cardNumber: 'z' }], Graveyard: [{ cardNumber: 'g' }] }
    };
    const result = preserveIdentities(prev, next);
    expect(result.playerOne.Graveyard).toBe(prev.playerOne.Graveyard);
    expect(result.playerOne.Hand).toEqual([{ cardNumber: 'z' }]);
  });
});
