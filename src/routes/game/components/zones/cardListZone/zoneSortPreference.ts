import { readCookie } from 'utils/cookieStore';

export const SORT_ZONES_BY_DEFAULT_COOKIE = 'sortZonesByDefault';

export const areZonesSortedByDefault = (): boolean =>
  readCookie(SORT_ZONES_BY_DEFAULT_COOKIE) === 'true';
