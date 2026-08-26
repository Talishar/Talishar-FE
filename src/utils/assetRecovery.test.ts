import { describe, expect, it } from 'vitest';
import {
  ASSET_RECOVERY_QUERY_PARAM,
  ASSET_RECOVERY_WINDOW_MS,
  buildAssetRecoveryUrl,
  shouldAttemptAssetRecovery
} from './assetRecovery';

describe('asset recovery', () => {
  it('allows the first attempt and rejects a recent repeat', () => {
    expect(shouldAttemptAssetRecovery(1000, null)).toBe(true);
    expect(shouldAttemptAssetRecovery(1000, 'not-a-number')).toBe(true);
    expect(shouldAttemptAssetRecovery(1000, '999')).toBe(false);
  });

  it('allows another attempt after the recovery window', () => {
    expect(
      shouldAttemptAssetRecovery(ASSET_RECOVERY_WINDOW_MS + 1001, '1000')
    ).toBe(true);
  });

  it('adds a cache-busting query while preserving route state', () => {
    const recovered = new URL(
      buildAssetRecoveryUrl(
        'https://talishar.net/game/play?gameName=123#board',
        456
      )
    );

    expect(recovered.pathname).toBe('/game/play');
    expect(recovered.searchParams.get('gameName')).toBe('123');
    expect(recovered.searchParams.get(ASSET_RECOVERY_QUERY_PARAM)).toBe('456');
    expect(recovered.hash).toBe('#board');
  });
});
