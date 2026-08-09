import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import {
  MAX_RUST_COUNTERS,
  RUST_PANEL_ATTENTION_EVENT
} from 'hooks/useRustCounters';
import HouseRewardedAd from './HouseRewardedAd';
import styles from './RustCounterPanel.module.css';

type RustCounterPanelProps = {
  rustCounters: number;
  isSupporter: boolean;
  onFallbackAdComplete?: () => void;
};

const RustCounterPanel = ({
  rustCounters,
  isSupporter,
  onFallbackAdComplete
}: RustCounterPanelProps) => {
  const { t } = useTranslation();
  const canTestRewardedAds = import.meta.env.DEV;
  const displayedRustCounters = Math.min(
    Math.max(0, rustCounters),
    MAX_RUST_COUNTERS
  );
  const isLocked = !isSupporter && displayedRustCounters >= MAX_RUST_COUNTERS;
  const shouldShowWatchAd = displayedRustCounters > 0 || canTestRewardedAds;
  const [showFallbackAd, setShowFallbackAd] = useState(false);
  const [isPulsing, setIsPulsing] = useState(isLocked);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLocked) setIsPulsing(true);
  }, [isLocked]);

  useEffect(() => {
    const handleAttention = () => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsPulsing(false);
      requestAnimationFrame(() => setIsPulsing(true));
    };
    window.addEventListener(RUST_PANEL_ATTENTION_EVENT, handleAttention);
    return () => {
      window.removeEventListener(RUST_PANEL_ATTENTION_EVENT, handleAttention);
    };
  }, []);

  const handleWatchAdClick = () => {
    let shown = false;
    try {
      shown = (window as any)._talishar_showRewarded?.() === true;
    } catch {
      // The ad script is third-party and may not be loaded (ad blocker, network
      // failure). Swallow and fall through to the in-house fallback ad below.
    }
    if (shown) {
      return;
    }
    setShowFallbackAd(true);
  };

  const handleFallbackAdComplete = () => {
    setShowFallbackAd(false);
    onFallbackAdComplete?.();
  };

  if (isSupporter && !canTestRewardedAds) {
    return (
      <div className={styles.panel}>
        <p className={styles.supporterMessage}>
          {t('RUST_COUNTER_PANEL.SUPPORTER_MESSAGE')}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${isLocked ? styles.panelLocked : ''}`}
      role={isLocked ? 'alert' : undefined}
    >
      <div className={styles.content}>
        <div className={styles.titleRow}>
          {displayedRustCounters > 0 && (
            <span className={styles.counterImages} aria-hidden="true">
              {Array.from({ length: displayedRustCounters }, (_, index) => (
                <img
                  key={index}
                  className={styles.counterImage}
                  src="/images/rust-counter.webp"
                  alt=""
                />
              ))}
            </span>
          )}
          <span className={styles.title}>
            {t('RUST_COUNTER_PANEL.RUST_COUNTERS', {
              count: displayedRustCounters,
              max: MAX_RUST_COUNTERS
            })}
          </span>
        </div>
        {canTestRewardedAds ? (
          <span className={styles.subtitle}>
            {t('RUST_COUNTER_PANEL.DEV_MODE_NOTE')}
          </span>
        ) : isLocked ? (
          <span className={styles.subtitle}>
            {t('RUST_COUNTER_PANEL.WATCH_AD_NOTE')}
          </span>
        ) : null}
      </div>
      <div className={styles.actions}>
        {shouldShowWatchAd && (
          <div className={styles.watchAdWrapper}>
            <button
              id="clearRust"
              type="button"
              className={`${styles.clearButton} ${
                isLocked ? styles.clearButtonLocked : ''
              } ${isLocked && isPulsing ? styles.pulse : ''}`}
              onClick={handleWatchAdClick}
              onAnimationEnd={() => setIsPulsing(false)}
            >
              {t('RUST_COUNTER_PANEL.WATCH_AD_TO_CLEAR')}
            </button>
          </div>
        )}
        <a
          className={styles.removeAdsLink}
          href="https://metafy.gg/@talishar"
          target="_blank"
          rel="noreferrer"
        >
          {t('UNITED_GAME_PANEL.REMOVE_ADS')}
        </a>
      </div>
      <span className={styles.helpWrapper}>
        <button
          type="button"
          className={styles.helpIcon}
          aria-label={t('RUST_COUNTER_PANEL.WHAT_ARE_RUST_COUNTERS')}
          aria-describedby="rust-counter-tooltip"
        >
          <FaQuestionCircle size={14} />
        </button>
        <span
          id="rust-counter-tooltip"
          role="tooltip"
          className={styles.tooltip}
        >
          {t('RUST_COUNTER_PANEL.TOOLTIP', { max: MAX_RUST_COUNTERS })}
        </span>
      </span>
      {showFallbackAd && (
        <HouseRewardedAd onRewardEarned={handleFallbackAdComplete} />
      )}
    </div>
  );
};

export default RustCounterPanel;
