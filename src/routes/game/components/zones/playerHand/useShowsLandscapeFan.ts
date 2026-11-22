import { useMediaQuery } from 'hooks/useMediaQuery';
import { useFannedHand } from './useFannedHand';
import { FANNED_HAND_MOBILE_QUERY } from './fanLayout';

export function useShowsLandscapeFan() {
  const fannedHand = useFannedHand();
  const isMobile = useMediaQuery(FANNED_HAND_MOBILE_QUERY);
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return fannedHand && isMobile && !isPortrait;
}
