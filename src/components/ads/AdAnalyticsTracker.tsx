import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ADS_ENABLED } from 'config/ads';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { beginAdPageView, endAdPageView } from 'utils/adAnalytics';
import {
  isForcedLayoutFrame,
  useForcedLayoutFrame
} from 'routes/game/play/forcedLayout/forcedLayout';

const AdAnalyticsTracker = () => {
  const { pathname } = useLocation();
  const { showAds } = useSupporterStatus();
  const isPlayPath = pathname.startsWith('/game/play');
  const framesPlay = useForcedLayoutFrame() !== null && isPlayPath;
  const skip = framesPlay || (isForcedLayoutFrame() && !isPlayPath);

  useEffect(() => {
    if (!ADS_ENABLED || !showAds || skip) return;
    beginAdPageView(pathname);
    return endAdPageView;
  }, [pathname, showAds, skip]);

  return null;
};

export default AdAnalyticsTracker;
