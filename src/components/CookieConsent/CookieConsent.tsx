import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CookieConsent.module.css';
import { initializeAdSense } from 'utils/adsenseInit';

interface CookieConsentProps {
  onConsent?: (accepted: boolean) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentStatus = localStorage.getItem('cookieConsent');
    if (!consentStatus) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Emit consent status if callback provided
      if (onConsent) {
        onConsent(consentStatus === 'accepted');
      }
    }
  }, [onConsent]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    
    // Initialize AdSense after consent
    initializeAdSense();
    
    if (onConsent) onConsent(true);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    if (onConsent) onConsent(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.cookieConsentOverlay}>
      <div className={styles.cookieConsentBanner}>
        <div className={styles.content}>
          <h3 className={styles.title}>🍪 Cookie Consent</h3>
          
          {!isExpanded ? (
            <p className={styles.description}>
              We use cookies and similar technologies to enhance your experience,
              analyze site traffic, and serve personalized advertisements through
              Google AdSense and other third-party services.
            </p>
          ) : (
            <div className={styles.expandedContent}>
              <p className={styles.description}>
                <strong>Essential Cookies:</strong> Required for game functionality,
                authentication, and session management.
              </p>
              <p className={styles.description}>
                <strong>Advertising Cookies:</strong> Google and its partners use
                cookies to serve ads based on your visits to our site and other
                sites. This helps us keep Talishar free to use.
              </p>
              <p className={styles.description}>
                <strong>Analytics:</strong> We use cookies to understand how visitors
                interact with our site to improve user experience.
              </p>
              <p className={styles.description}>
                You can manage your preferences anytime through your browser settings
                or by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Ads Settings
                </a>.
              </p>
            </div>
          )}

          <button
            className={styles.learnMoreButton}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Learn More'}
          </button>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.acceptButton}`}
            onClick={handleAccept}
          >
            Accept All Cookies
          </button>
          <button
            className={`${styles.button} ${styles.essentialButton}`}
            onClick={handleDecline}
          >
            Essential Only
          </button>
          <Link to="/privacy" className={styles.privacyLink}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
