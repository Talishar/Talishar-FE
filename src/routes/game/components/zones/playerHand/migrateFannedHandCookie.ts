import { appCookies } from 'utils/cookieStore';
import { COOKIE_OPTIONS } from 'features/settings/useSettingsController';
import {
  ENABLE_FANNED_HAND_MOBILE_COOKIE,
  ENABLE_FANNED_HAND_PC_COOKIE,
  FANNED_HAND_MOBILE_QUERY,
  LEGACY_FANNED_HAND_COOKIE
} from './fanLayout';

export function migrateFannedHandCookie() {
  const legacy = appCookies.get(LEGACY_FANNED_HAND_COOKIE);
  if (legacy === undefined) return;
  const target = window.matchMedia(FANNED_HAND_MOBILE_QUERY).matches
    ? ENABLE_FANNED_HAND_MOBILE_COOKIE
    : ENABLE_FANNED_HAND_PC_COOKIE;
  if (appCookies.get(target) === undefined) {
    appCookies.set(target, String(legacy), COOKIE_OPTIONS);
  }
  appCookies.remove(LEGACY_FANNED_HAND_COOKIE, { path: '/' });
}
