import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieString } from 'utils/cookieStore';
import { useForcedBoard } from 'routes/game/play/forcedLayout/forcedLayout';
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
  const forcedBoard = useForcedBoard();
  if (forcedBoard) return true;
  return isMobile ? mobileOn : pcOn;
}
