import React, { useEffect, useState } from 'react';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import styles from './AdBlockingRecovery.module.css';

type ReviqApi = {
  checkAdblock?: () => Promise<boolean>;
  onAdblock?: (cb: () => void) => void;
  setAdsEnabled?: (enabled: boolean) => void;
  push?: (fn: (api: ReviqApi) => void) => unknown;
};

declare global {
  interface Window {
    reviq?: ReviqApi;
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
      const reviq = window.reviq ?? ([] as unknown as ReviqApi);
      window.reviq = reviq;
      reviq.push?.((api) => api.setAdsEnabled?.(true));
      setVisible(true);
      return;
    }

    const handleAdblock = (api: ReviqApi) => {
      try {
        api.setAdsEnabled?.(true);
      } catch {
        // Still show recovery messaging if RevIQ cannot enable ads.
      }
      setVisible(true);
    };

    const check = async () => {
      try {
        const reviq = window.reviq ?? ([] as unknown as ReviqApi);
        window.reviq = reviq;

        if (typeof reviq.checkAdblock === 'function') {
          const hasAdblock = await reviq.checkAdblock();
          if (hasAdblock) handleAdblock(reviq);
        } else if (typeof reviq.onAdblock === 'function') {
          reviq.onAdblock(() => handleAdblock(reviq));
        } else if (typeof reviq.push === 'function') {
          reviq.push((api) => {
            if (typeof api.checkAdblock === 'function') {
              api
                .checkAdblock()
                .then((hasAdblock) => {
                  if (hasAdblock) handleAdblock(api);
                })
                .catch(() => undefined);
            } else if (typeof api.onAdblock === 'function') {
              api.onAdblock(() => handleAdblock(api));
            }
          });
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
