import { useMediaQuery } from 'hooks/useMediaQuery';
import { useFannedHand } from './useFannedHand';

export function useShowsLandscapeFan() {
  const fannedHand = useFannedHand();
  const isMobile = useMediaQuery('(max-width: 1199px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return fannedHand && isMobile && !isPortrait;
}
