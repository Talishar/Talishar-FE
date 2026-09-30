import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsX } from 'react-icons/bs';
import { ADS_ENABLED, isVideoAdRoute } from 'config/ads';
import useSupporterStatus from 'hooks/useSupporterStatus';
import RemoveAdsLink from 'components/RemoveAdsLink/RemoveAdsLink';
import {
  restartVideoAdTagIfUsed,
  VIDEO_AD_SLOT_ID,
  VIDEO_AD_STARTED_EVENT
} from 'utils/videoAds';
import styles from './VideoAdDock.module.css';

let dismissedThisVisit = false;

const VideoAdPlayer = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const dockRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useLayoutEffect(() => {
    dockRef.current?.toggleAttribute('inert', !isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    restartVideoAdTagIfUsed();

    // Media events don't bubble, but they do pass through the capture phase.
    const onPlaying = () => setIsPlaying(true);
    slot.addEventListener('playing', onPlaying, true);
    slot.addEventListener(VIDEO_AD_STARTED_EVENT, onPlaying);

    const observer = new MutationObserver(() => {
      if (slot.childElementCount === 0) setIsPlaying(false);
    });
    observer.observe(slot, { childList: true });

    return () => {
      slot.removeEventListener('playing', onPlaying, true);
      slot.removeEventListener(VIDEO_AD_STARTED_EVENT, onPlaying);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={dockRef}
      className={styles.dock}
      data-playing={isPlaying}
      role="complementary"
      aria-label={t('VIDEO_AD.LABEL')}
    >
      <div className={styles.bar}>
        <RemoveAdsLink className={styles.removeAds} />
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t('VIDEO_AD.CLOSE')}
        >
          <BsX aria-hidden="true" />
        </button>
      </div>
      <div id={VIDEO_AD_SLOT_ID} ref={slotRef} className={styles.slot} />
    </div>
  );
};

const VideoAdDock = () => {
  const { pathname } = useLocation();
  const { showAds } = useSupporterStatus();
  const [isDismissed, setIsDismissed] = useState(() => dismissedThisVisit);

  if (!ADS_ENABLED || !showAds || isDismissed || !isVideoAdRoute(pathname)) {
    return null;
  }

  const handleClose = () => {
    dismissedThisVisit = true;
    setIsDismissed(true);
  };

  return <VideoAdPlayer onClose={handleClose} />;
};

export default VideoAdDock;
