import { shouldShowAdsForUser } from './useSupporterStatus';

describe('supporter ad visibility overrides', () => {
  it('forces ads for PvtVoid even when the account is a supporter', () => {
    expect(shouldShowAdsForUser('PvtVoid', true, false)).toBe(true);
  });

  it('does not force ads for other supporters', () => {
    expect(shouldShowAdsForUser('OtherContributor', true, false)).toBe(false);
  });

  it('waits for supporter status before showing ads', () => {
    expect(shouldShowAdsForUser('PvtVoid', true, true)).toBe(false);
  });

  it('continues showing ads to non-supporters', () => {
    expect(shouldShowAdsForUser('FreePlayer', false, false)).toBe(true);
  });
});
