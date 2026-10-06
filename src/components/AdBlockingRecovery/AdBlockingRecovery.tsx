import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { isAdBlocked } from 'utils/adBlockDetection';
import styles from './AdBlockingRecovery.module.css';

type ReviqApi = {
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
  const { t } = useTranslation();
  const { showAds } = useSupporterStatus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!showAds) {
      setVisible(false);
      return;
    }

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION_MS) {
      return;
    }

    // Dev override: append ?adblock=1 to the URL to force the modal
    if (new URLSearchParams(window.location.search).get('adblock') === '1') {
      const reviq = window.reviq ?? ([] as unknown as ReviqApi);
      window.reviq = reviq;
      if (typeof reviq.setAdsEnabled === 'function') {
        reviq.setAdsEnabled(true);
      } else {
        reviq.push?.((api) => api.setAdsEnabled?.(true));
      }
      setVisible(true);
      return;
    }

    if (!isAdBlocked()) return;

    try {
      const reviq = window.reviq ?? ([] as unknown as ReviqApi);
      window.reviq = reviq;
      if (typeof reviq.setAdsEnabled === 'function') {
        reviq.setAdsEnabled(true);
      } else {
        reviq.push?.((api) => api.setAdsEnabled?.(true));
      }
    } catch {
      // Recovery messaging still works if RevIQ is unavailable.
    }
    setVisible(true);
  }, [showAds]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !showAds) return null;

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <p className={styles.title}>{t('AD_BLOCKING_RECOVERY.TITLE')}</p>
        <p className={styles.description}>
          {t('AD_BLOCKING_RECOVERY.DESCRIPTION')}
        </p>
        <p className={styles.subDescription}>
          <Trans i18nKey="AD_BLOCKING_RECOVERY.SUPPORT_DIRECTLY">
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
          </Trans>
        </p>
        <button className={styles.dismissButton} onClick={handleDismiss}>
          {t('AD_BLOCKING_RECOVERY.DISMISS')}
        </button>
      </div>
    </div>
  );
};

export default AdBlockingRecovery;
