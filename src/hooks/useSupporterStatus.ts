import { useEffect, useState } from 'react';
import { useGetUserProfileQuery } from 'features/api/apiSlice';
import useAuth from 'hooks/useAuth';

const CACHE_KEY = 'talishar_supporter_status';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
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
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
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
 * Caches the result in localStorage for 1 hour to avoid repeated DB calls.
 */
export default function useSupporterStatus(): {
  isSupporter: boolean;
  isLoading: boolean;
  showAds: boolean;
} {
  const { isLoggedIn, currentUserName, isLoading: isAuthLoading } = useAuth();

  const cached = readCache();
  const skipApiCall = !isLoggedIn || cached !== null;

  const { data: profileData, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, { skip: skipApiCall });

  const [isSupporter, setIsSupporter] = useState<boolean>(
    cached?.isSupporter ?? false
  );

  useEffect(() => {
    if (!isLoggedIn) {
      // Not logged in – clear any stale cache and show ads
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        // ignore
      }
      setIsSupporter(false);
      return;
    }

    if (cached !== null) {
      // Fresh cache hit – no API call needed
      setIsSupporter(cached.isSupporter);
      return;
    }

    if (!isProfileLoading && profileData !== undefined) {
      const value =
        (profileData.isMetafySupporter ?? false) ||
        (profileData.isPatreonSupporter ?? false);
      writeCache(value);
      setIsSupporter(value);
    }
  }, [isLoggedIn, isProfileLoading, profileData]);

  const isLoading = isAuthLoading || (!skipApiCall && isProfileLoading);
  const showAds = shouldShowAdsForUser(currentUserName, isSupporter, isLoading);

  return { isSupporter, isLoading, showAds };
}
