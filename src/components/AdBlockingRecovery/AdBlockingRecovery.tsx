import React, { useEffect, useState } from 'react';
import styles from './AdBlockingRecovery.module.css';
import useAuth from 'hooks/useAuth';

const AdBlockingRecovery: React.FC = () => {
  // Ad blocker detection is currently disabled
  return null;

  // const { isPatron } = useAuth();
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if ad blocker is active by detecting if the rev.iq script loaded
    const detectAdBlocker = () => {
      // Check if any rev.iq ad scripts have loaded
      const hasRevIqScript = !!document.querySelector('script[src*="rev.iq"]');

      // If the rev.iq script didn't load at all, it's likely blocked
      if (!hasRevIqScript) {
        setIsAdBlockerDetected(true);
        return;
      }

      // Check if any ad containers have been filled by rev.iq
      const adElements = document.querySelectorAll('[data-ad]');

      if (adElements.length === 0) {
        setIsAdBlockerDetected(false);
        return;
      }

      let hasVisibleAds = false;

      adElements.forEach((adEl) => {
        const el = adEl as HTMLElement;
        if (el.children.length > 0 || el.offsetHeight > 0) {
          hasVisibleAds = true;
        }
      });

      setIsAdBlockerDetected(!hasVisibleAds);
    };

    // Run detection after a delay to give ads time to load
    const timer = setTimeout(detectAdBlocker, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember the dismissal for 24 hours
    localStorage.setItem(
      'adBlockingRecoveryDismissed',
      new Date().toISOString()
    );
  };

  // Check if user dismissed this recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('adBlockingRecoveryDismissed');
    if (dismissedTime) {
      const hoursSinceDismissal =
        (Date.now() - new Date(dismissedTime).getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismissal < 24) {
        setIsDismissed(true);
      }
    }
  }, []);

  if (!isAdBlockerDetected || isDismissed || isPatron) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <h3 className={styles.title}>We Notice You're Using an Ad Blocker</h3>
        <p className={styles.description}>
          Talishar is free to play thanks to ad revenue and Metafy support. Our
          ads placement is carefully selected to not interfere with gameplay.
          Please consider disabling your ad blocker to support our work.
        </p>
        <p className={styles.subDescription}>
          Alternatively, you can{' '}
          <a
            href="https://metafy.gg/@Talishar"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            support us on Metafy
          </a>{' '}
          to help keep Talishar running and hide all ads!
        </p>
        <button
          className={styles.dismissButton}
          onClick={handleDismiss}
          title="Dismiss this message for 24 hours"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default AdBlockingRecovery;
