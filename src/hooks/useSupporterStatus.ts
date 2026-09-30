import { useEffect, useState } from 'react';
import { useGetUserProfileQuery } from 'features/api/apiSlice';
import useAuth from 'hooks/useAuth';

const CACHE_KEY = 'talishar_supporter_status_v2';
const POSITIVE_TTL_MS = 24 * 60 * 60 * 1000;
const NEGATIVE_TTL_MS = 5 * 60 * 1000;
const FORCE_ADS_USERNAMES = new Set(['PvtVoid']);

interface CachedSupporterStatus {
  isSupporter: boolean;
  cachedAt: number;
}

function readCache(): CachedSupporterStatus | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedSupporterStatus = JSON.parse(raw);
    const ttl = parsed.isSupporter ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
    if (Date.now() - parsed.cachedAt > ttl) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(isSupporter: boolean): void {
  try {
    const entry: CachedSupporterStatus = { isSupporter, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage unavailable – silently skip
  }
}

const INVALIDATED_EVENT = 'talishar:supporter-status-invalidated';

function removeCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // localStorage unavailable – silently skip
  }
}

export function clearSupporterStatusCache(): void {
  removeCache();
  window.dispatchEvent(new Event(INVALIDATED_EVENT));
}

export function shouldShowAdsForUser(
  userName: string | null | undefined,
  isSupporter: boolean,
  isLoading: boolean
): boolean {
  if (isLoading) return false;
  return !isSupporter || FORCE_ADS_USERNAMES.has(userName ?? '');
}

/**
 * Returns whether the current user is a paid supporter.
 * Caches the result in localStorage to avoid repeated DB calls: 24 hours for a
 * positive result, 5 minutes for a negative one.
 */
export default function useSupporterStatus(): {
  isSupporter: boolean;
  isLoading: boolean;
  showAds: boolean;
} {
  const { isLoggedIn, currentUserName, isLoading: isAuthLoading } = useAuth();

  const [cacheEpoch, setCacheEpoch] = useState(0);
  useEffect(() => {
    const onInvalidated = () => setCacheEpoch((epoch) => epoch + 1);
    window.addEventListener(INVALIDATED_EVENT, onInvalidated);
    return () => window.removeEventListener(INVALIDATED_EVENT, onInvalidated);
  }, []);

  const cached = readCache();
  const skipApiCall = !isLoggedIn || cached !== null;

  const { data: profileData, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, { skip: skipApiCall });
  const profileIsSupporter =
    profileData === undefined
      ? null
      : (profileData.isMetafySupporter ?? false) ||
        (profileData.isPatreonSupporter ?? false);

  const [isSupporter, setIsSupporter] = useState<boolean>(
    cached?.isSupporter ?? false
  );

  useEffect(() => {
    if (!isLoggedIn) {
      // removeCache, not clearSupporterStatusCache: broadcasting from here would
      // re-enter this same effect in every mounted hook, forever.
      if (!isAuthLoading) {
        removeCache();
        setIsSupporter(false);
      }
      return;
    }

    if (cached !== null) {
      // Fresh cache hit – no API call needed
      setIsSupporter(cached.isSupporter);
      return;
    }

    if (!isProfileLoading && profileIsSupporter !== null) {
      writeCache(profileIsSupporter);
      setIsSupporter(profileIsSupporter);
    }
  }, [
    isLoggedIn,
    isAuthLoading,
    isProfileLoading,
    profileIsSupporter,
    cacheEpoch
  ]);

  const isLoading = isAuthLoading || (!skipApiCall && isProfileLoading);
  // The effect above lands the fetched status in state one commit late, and
  // the cache it writes can be read by another instance before that. Until
  // then a supporter would count as ad-eligible, long enough to mount ad units
  // and load the ad provider, so read the cache and the profile directly.
  const resolvedIsSupporter = isLoggedIn
    ? cached?.isSupporter ?? profileIsSupporter ?? isSupporter
    : isSupporter;
  const showAds = shouldShowAdsForUser(
    currentUserName,
    resolvedIsSupporter,
    isLoading
  );

  return { isSupporter: resolvedIsSupporter, isLoading, showAds };
}
