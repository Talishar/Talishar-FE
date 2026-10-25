import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ADS_ENABLED } from 'config/ads';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { beginAdPageView, endAdPageView } from 'utils/adAnalytics';
import {
  FORCED_LAYOUT,
  useForcedLayoutFrame
} from 'routes/game/play/forcedLayout/forcedLayout';

const AdAnalyticsTracker = () => {
  const { pathname } = useLocation();
  const { showAds } = useSupporterStatus();
  const framesPlay =
    useForcedLayoutFrame() !== FORCED_LAYOUT.NONE &&
    pathname.startsWith('/game/play');

  useEffect(() => {
    if (!ADS_ENABLED || !showAds || framesPlay) return;
    beginAdPageView(pathname);
    return endAdPageView;
  }, [pathname, showAds, framesPlay]);

  return null;
};

export default AdAnalyticsTracker;
