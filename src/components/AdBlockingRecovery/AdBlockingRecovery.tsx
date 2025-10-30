import React, { useEffect, useState } from 'react';
import styles from './AdBlockingRecovery.module.css';
import useAuth from 'hooks/useAuth';

const AdBlockingRecovery: React.FC = () => {
  const { isPatron } = useAuth();
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if ad blocker is active
    // This works by trying to fetch an ad and seeing if it's blocked
    const detectAdBlocker = async () => {
      try {
        // Check if adsbygoogle script loaded
        if (!window.adsbygoogle) {
          setIsAdBlockerDetected(true);
          return;
        }

        // Try to fetch a pixel from ad networks
        const response = await fetch(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
          { mode: 'no-cors' }
        );

        // If fetch fails, ad blocker is likely active
        if (!response.ok) {
          setIsAdBlockerDetected(true);
        }
      } catch {
        // Fetch error likely means ad blocker is active
        setIsAdBlockerDetected(true);
      }
    };

    // Run detection after a short delay to ensure scripts have time to load
    const timer = setTimeout(detectAdBlocker, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember the dismissal for 24 hours
    localStorage.setItem('adBlockingRecoveryDismissed', new Date().toISOString());
  };

  // Check if user dismissed this recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('adBlockingRecoveryDismissed');
    if (dismissedTime) {
      const hoursSinceDismissal = (Date.now() - new Date(dismissedTime).getTime()) / (1000 * 60 * 60);
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
          Talishar is free to play thanks to ad revenue and Patreon support. Our ads placement is carefully selected
          to not interfere with gameplay. Please consider disabling your ad blocker to
          support our work.
        </p>
        <p className={styles.subDescription}>
          Alternatively, you can{' '}
          <a
            href="https://linktr.ee/Talishar"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            support us on Patreon
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
