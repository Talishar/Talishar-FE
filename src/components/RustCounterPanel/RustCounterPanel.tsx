import { FaQuestionCircle } from 'react-icons/fa';
import styles from './RustCounterPanel.module.css';

type RustCounterPanelProps = {
  rustCounters: number;
  isSupporter: boolean;
};

const RustCounterPanel = ({
  rustCounters,
  isSupporter
}: RustCounterPanelProps) => {
  const displayedRustCounters = Math.min(Math.max(0, rustCounters), 3);

  if (isSupporter) {
    return (
      <div className={styles.panel}>
        <p className={styles.supporterMessage}>
          Thank you for your support. You are helping keep the servers running.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.summary}>
        <span className={styles.counterImages} aria-hidden="true">
          {displayedRustCounters > 0 ? (
            Array.from({ length: displayedRustCounters }, (_, index) => (
              <img
                key={index}
                className={styles.counterImage}
                src="/images/rust-counter.webp"
                alt=""
              />
            ))
          ) : null}
        </span>
        <span>
          Rust counters: <strong>{displayedRustCounters}</strong> / 3
        </span>
        <span
          className={styles.helpIcon}
          title="Rust counters are accrued by playing games as a non-supporter. When you have 3 counters, you can no longer queue for games. You can clear them by watching a rewarded ad, or remove ads by supporting Talishar on Metafy. Your support helps us run the server and maintain the site for everyone to enjoy."
          aria-label="What are rust counters?"
        >
          <FaQuestionCircle size={14} />
        </span>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.clearButton}>
          Watch ad to clear
        </button>
        <a
          className={styles.removeAdsLink}
          href="https://metafy.gg/@talishar"
          target="_blank"
          rel="noreferrer"
        >
          Remove ads
        </a>
      </div>
    </div>
  );
};

export default RustCounterPanel;
