import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieString } from 'utils/cookieStore';
import { ENABLE_FANNED_HAND_COOKIE } from './fanLayout';

export function useShowsLandscapeFan() {
  const fannedHand = useCookieString(ENABLE_FANNED_HAND_COOKIE) === 'true';
  const isMobile = useMediaQuery('(max-width: 1199px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  return fannedHand && isMobile && !isPortrait && playerID !== 3 && !isReplay;
}
