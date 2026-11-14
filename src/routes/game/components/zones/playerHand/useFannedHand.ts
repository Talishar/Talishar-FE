import { useCookieString } from 'utils/cookieStore';
import { frameHost } from 'routes/game/play/forcedLayout/forcedLayout';
import { CLASSIC_HAND_COOKIE } from './fanLayout';

export function useFannedHand() {
  const classic = useCookieString(CLASSIC_HAND_COOKIE) === 'true';
  if (frameHost) return true;
  return !classic;
}
