import { describe, expect, it } from 'vitest';
import { ERROR_CARD_SRC, isStaleAssetError } from './errorPage';

describe('isStaleAssetError', () => {
  it.each([
    'Failed to fetch dynamically imported module: /assets/Play.js',
    'ChunkLoadError: Loading chunk 42 failed',
    'Importing a module script failed',
    'Unable to preload CSS for /assets/game.css'
  ])('recognizes a stale asset error: %s', (message) => {
    expect(isStaleAssetError(message)).toBe(true);
  });

  it('does not hide unrelated error details', () => {
    expect(isStaleAssetError('The requested game could not be found')).toBe(
      false
    );
  });
});

describe('error card', () => {
  it('keeps the same fixed English image URL without the full card resolver', () => {
    expect(ERROR_CARD_SRC).toBe(
      'https://images.talishar.net/public/cardimages/english/WTR224.webp'
    );
  });
});
