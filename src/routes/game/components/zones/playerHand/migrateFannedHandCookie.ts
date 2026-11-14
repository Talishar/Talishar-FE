import { appCookies } from 'utils/cookieStore';
import { LEGACY_FANNED_HAND_COOKIES } from './fanLayout';

export function migrateFannedHandCookie() {
  for (const name of LEGACY_FANNED_HAND_COOKIES) {
    if (appCookies.get(name) !== undefined) {
      appCookies.remove(name, { path: '/' });
    }
  }
}
