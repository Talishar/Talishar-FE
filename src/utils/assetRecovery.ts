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

export const attemptAssetRecovery = (force = false): boolean => {
  const now = Date.now();

  try {
    const lastAttempt = window.sessionStorage.getItem(
      ASSET_RECOVERY_STORAGE_KEY
    );
    if (!force && !shouldAttemptAssetRecovery(now, lastAttempt)) return false;
    window.sessionStorage.setItem(ASSET_RECOVERY_STORAGE_KEY, String(now));
  } catch {
    // Without session storage we cannot safely distinguish a first attempt
    // from a reload loop. Leave recovery to the user-facing button.
    if (!force) return false;
  }

  window.location.replace(buildAssetRecoveryUrl(window.location.href, now));
  return true;
};
