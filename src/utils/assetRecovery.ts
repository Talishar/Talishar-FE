export const ASSET_RECOVERY_QUERY_PARAM = 'talishar_asset_retry';
export const ASSET_RECOVERY_STORAGE_KEY = 'talishar.staleAssetReload';
export const ASSET_RECOVERY_WINDOW_MS = 60000;

export const shouldAttemptAssetRecovery = (
  now: number,
  lastAttempt: string | null
): boolean => {
  if (lastAttempt === null) return true;

  const previous = Number.parseInt(lastAttempt, 10);
  return Number.isNaN(previous) || now - previous > ASSET_RECOVERY_WINDOW_MS;
};

export const buildAssetRecoveryUrl = (href: string, now: number): string => {
  const url = new URL(href);
  url.searchParams.set(ASSET_RECOVERY_QUERY_PARAM, String(now));
  return url.toString();
};

export const attemptAssetRecovery = (): boolean => {
  const now = Date.now();

  try {
    const lastAttempt = window.sessionStorage.getItem(
      ASSET_RECOVERY_STORAGE_KEY
    );
    if (!shouldAttemptAssetRecovery(now, lastAttempt)) return false;
    window.sessionStorage.setItem(ASSET_RECOVERY_STORAGE_KEY, String(now));
  } catch {
    // Without session storage there is no safe way to prevent a reload loop.
    return false;
  }

  window.location.replace(buildAssetRecoveryUrl(window.location.href, now));
  return true;
};
