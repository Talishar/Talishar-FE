import React, { useEffect, useState } from 'react';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import styles from './AdBlockingRecovery.module.css';

declare global {
  interface Window {
    reviq?: {
      checkAdblock: () => Promise<boolean>;
      onAdblock: (cb: () => void) => void;
      push: (fn: (obj: { setKv: (k: string, v: number) => void }) => void) => void;
    };
  }
}

const DISMISS_KEY = 'talishar_adblock_dismissed';
const DISMISS_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

const AdBlockingRecovery: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION_MS) {
      return;
    }

    // Dev override: append ?adblock=1 to the URL to force the modal
    if (new URLSearchParams(window.location.search).get('adblock') === '1') {
      setVisible(true);
      return;
    }

    const check = async () => {
      try {
        if (typeof window.reviq?.checkAdblock === 'function') {
          const hasAdblock = await window.reviq.checkAdblock();
          if (hasAdblock) setVisible(true);
        } else if (typeof window.reviq?.onAdblock === 'function') {
          window.reviq.onAdblock(() => setVisible(true));
        }
      } catch {
        // Detection unavailable; silently ignore
      }
    };

    check();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <p className={styles.title}>Ad Blocker Detected</p>
        <p className={styles.description}>
          Talishar is free to play and supported by ads. Please consider
          disabling your ad blocker to help keep the platform running.
        </p>
        <p className={styles.subDescription}>
          You can also support us directly on{' '}
          <a
            className={styles.link}
            href={TALISHAR_METAFY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Metafy
          </a>
          .
        </p>
        <button className={styles.dismissButton} onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default AdBlockingRecovery;
