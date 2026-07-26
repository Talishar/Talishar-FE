import { useEffect, useRef, useState } from 'react';
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
          Thank you for your support! ❤️
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
            Rust counters: {displayedRustCounters} / {MAX_RUST_COUNTERS}
          </span>
        </div>
        {canTestRewardedAds ? (
          <span className={styles.subtitle}>
            Development mode: rust counters do not block games.
          </span>
        ) : isLocked ? (
          <span className={styles.subtitle}>
            Watch a short ad to keep playing.
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
              Watch Ad to Clear
            </button>
          </div>
        )}
        <a
          className={styles.removeAdsLink}
          href="https://metafy.gg/@talishar"
          target="_blank"
          rel="noreferrer"
        >
          Remove ads
        </a>
      </div>
      <span className={styles.helpWrapper}>
        <button
          type="button"
          className={styles.helpIcon}
          aria-label="What are rust counters?"
          aria-describedby="rust-counter-tooltip"
        >
          <FaQuestionCircle size={14} />
        </button>
        <span
          id="rust-counter-tooltip"
          role="tooltip"
          className={styles.tooltip}
        >
          Rust counters accrue as you play games as a non-supporter. At{' '}
          {MAX_RUST_COUNTERS} counters you can no longer queue for games. Clear
          them by watching a rewarded ad, or remove ads entirely by supporting
          Talishar on Metafy for as low as 5$ per month. Your support keeps the
          servers running and support the developers.
        </span>
      </span>
      {showFallbackAd && (
        <HouseRewardedAd onRewardEarned={handleFallbackAdComplete} />
      )}
    </div>
  );
};

export default RustCounterPanel;
