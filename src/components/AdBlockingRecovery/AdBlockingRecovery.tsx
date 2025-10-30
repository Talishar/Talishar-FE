import React, { useEffect, useState } from 'react';
import styles from './AdBlockingRecovery.module.css';
import useAuth from 'hooks/useAuth';

const AdBlockingRecovery: React.FC = () => {
  const { isPatron } = useAuth();
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if ad blocker is active by detecting if Google AdSense script loaded
    const detectAdBlocker = () => {
      // Method 1: Check if adsbygoogle array exists and is properly initialized
      const hasAdsByGoogle = typeof window.adsbygoogle !== 'undefined' && Array.isArray(window.adsbygoogle);
      
      // If adsbygoogle script didn't load at all, it's likely blocked
      if (!hasAdsByGoogle) {
        setIsAdBlockerDetected(true);
        return;
      }
      
      // Method 2: Check if any ad elements are hidden/blocked
      const adElements = document.querySelectorAll('.adsbygoogle');
      
      // If no ad elements exist on the page, we can't determine if ads are blocked
      // This could mean ads aren't set up yet or AdSense isn't approved
      if (adElements.length === 0) {
        setIsAdBlockerDetected(false);
        return;
      }
      
      let hasVisibleAds = false;
      let hasErroredAds = false;
      
      adElements.forEach((adEl) => {
        const el = adEl as HTMLElement;
        const adStatus = el.getAttribute('data-adsbygoogle-status');
        
        // Check if element has been successfully filled by AdSense
        if (adStatus === 'done' && (el.children.length > 0 || el.offsetHeight > 0)) {
          hasVisibleAds = true;
        }
        
        // Check if AdSense returned an error (not approved, policy violation, etc.)
        if (adStatus === 'unfilled' || adStatus === 'error') {
          hasErroredAds = true;
        }
      });
      
      // Only mark as blocked if:
      // 1. Ad elements exist
      // 2. None are visible
      // 3. AdSense didn't report errors (which would indicate account/approval issues)
      if (!hasVisibleAds && !hasErroredAds) {
        // Ads should work but aren't rendering - likely blocked by ad blocker
        setIsAdBlockerDetected(true);
      } else {
        // Either ads are working OR AdSense reported issues (not user's fault)
        setIsAdBlockerDetected(false);
      }
    };

    // Run detection after a delay to give ads time to load
    // Use longer delay to ensure ads have actually tried to render
    const timer = setTimeout(detectAdBlocker, 3000);
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
