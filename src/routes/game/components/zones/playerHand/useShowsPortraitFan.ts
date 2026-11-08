import { useMediaQuery } from 'hooks/useMediaQuery';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useFannedHand } from './useFannedHand';

export function useShowsPortraitFan() {
  const fannedHand = useFannedHand();
  const isMobile = useMediaQuery('(max-width: 1199px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  return fannedHand && isMobile && isPortrait && !(playerID === 3 && !isReplay);
}
