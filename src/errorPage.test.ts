import { describe, expect, it } from 'vitest';
import { isStaleAssetError } from './errorPage';

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
    expect(isStaleAssetError('The requested game could not be found')).toBe(false);
  });
});
