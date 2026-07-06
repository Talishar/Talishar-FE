import { useEffect, useRef, useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import {
  MAX_RUST_COUNTERS,
  RUST_PANEL_ATTENTION_EVENT
} from 'hooks/useRustCounters';
import styles from './RustCounterPanel.module.css';

type RustCounterPanelProps = {
  rustCounters: number;
  isSupporter: boolean;
};

const AD_UNAVAILABLE_MESSAGE_MS = 5000;

const RustCounterPanel = ({
  rustCounters,
  isSupporter
}: RustCounterPanelProps) => {
  const displayedRustCounters = Math.min(
    Math.max(0, rustCounters),
    MAX_RUST_COUNTERS
  );
  const isLocked = !isSupporter && displayedRustCounters >= MAX_RUST_COUNTERS;
  const [adUnavailable, setAdUnavailable] = useState(false);
  const [isPulsing, setIsPulsing] = useState(isLocked);
  const unavailableTimeoutRef = useRef<number | null>(null);
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

  useEffect(() => {
    const handleAdReady = (event: Event) => {
      const ready = (event as CustomEvent<{ ready: boolean }>).detail?.ready;
      if (ready) {
        setAdUnavailable(false);
        if (unavailableTimeoutRef.current !== null) {
          window.clearTimeout(unavailableTimeoutRef.current);
          unavailableTimeoutRef.current = null;
        }
      }
    };
    window.addEventListener('talishar:rewardedAdReady', handleAdReady);
    return () => {
      window.removeEventListener('talishar:rewardedAdReady', handleAdReady);
      if (unavailableTimeoutRef.current !== null) {
        window.clearTimeout(unavailableTimeoutRef.current);
      }
    };
  }, []);

  const handleWatchAdClick = () => {
    const shown = (window as any)._talishar_showRewarded?.();
    if (shown) {
      setAdUnavailable(false);
      return;
    }
    setAdUnavailable(true);
    if (unavailableTimeoutRef.current !== null) {
      window.clearTimeout(unavailableTimeoutRef.current);
    }
    unavailableTimeoutRef.current = window.setTimeout(() => {
      setAdUnavailable(false);
      unavailableTimeoutRef.current = null;
    }, AD_UNAVAILABLE_MESSAGE_MS);
  };

  if (isSupporter) {
    return (
      <div className={styles.panel}>
        <p className={styles.supporterMessage}>
          Thank you for your support! You are helping keep the servers running ❤️
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
        {isLocked && (
          <span className={styles.subtitle}>
            Watch a short ad to keep playing.
          </span>
        )}
      </div>
      <div className={styles.actions}>
        {displayedRustCounters > 0 && (
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
            {adUnavailable && (
              <span className={styles.adUnavailableMessage} role="status">
                No ad available right now, please try again in a moment.
              </span>
            )}
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
          Talishar on Metafy for as low as 5$ per month. Your support keeps the servers running for
          everyone.
        </span>
      </span>
    </div>
  );
};

export default RustCounterPanel;
