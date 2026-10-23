import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieString } from 'utils/cookieStore';
import {
  ENABLE_FANNED_HAND_MOBILE_COOKIE,
  ENABLE_FANNED_HAND_PC_COOKIE,
  FANNED_HAND_MOBILE_QUERY
} from './fanLayout';

export function useFannedHand() {
  const isMobile = useMediaQuery(FANNED_HAND_MOBILE_QUERY);
  const mobileOn =
    useCookieString(ENABLE_FANNED_HAND_MOBILE_COOKIE) !== 'false';
  const pcOn = useCookieString(ENABLE_FANNED_HAND_PC_COOKIE) === 'true';
  return isMobile ? mobileOn : pcOn;
}
