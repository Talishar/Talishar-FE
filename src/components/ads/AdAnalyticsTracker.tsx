import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ADS_ENABLED } from 'config/ads';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { beginAdPageView, endAdPageView } from 'utils/adAnalytics';

const AdAnalyticsTracker = () => {
  const { pathname } = useLocation();
  const { showAds } = useSupporterStatus();

  useEffect(() => {
    if (!ADS_ENABLED || !showAds) return;
    beginAdPageView(pathname);
    return endAdPageView;
  }, [pathname, showAds]);

  return null;
};

export default AdAnalyticsTracker;
