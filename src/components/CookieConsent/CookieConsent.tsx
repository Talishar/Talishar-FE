import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CookieConsent.module.css';
import {
  getConsentStatus,
  setConsentStatus,
  loadGoogleAnalytics,
  clearAnalyticsCookies,
  OPEN_COOKIE_CONSENT_EVENT
} from 'utils/cookieConsent';

interface CookieConsentProps {
  onConsent?: (accepted: boolean) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentStatus = getConsentStatus();
    if (!consentStatus) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    if (consentStatus === 'accepted') {
      loadGoogleAnalytics();
    }
    if (onConsent) {
      onConsent(consentStatus === 'accepted');
    }
  }, [onConsent]);

  useEffect(() => {
    const handleOpen = () => {
      setIsExpanded(true);
      setIsVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_CONSENT_EVENT, handleOpen);
    return () =>
      window.removeEventListener(OPEN_COOKIE_CONSENT_EVENT, handleOpen);
  }, []);

  const handleAccept = () => {
    setConsentStatus('accepted');
    loadGoogleAnalytics();
    setIsVisible(false);

    if (onConsent) onConsent(true);
  };

  const handleDecline = () => {
    setConsentStatus('declined');
    clearAnalyticsCookies();
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
              Talishar uses essential cookies to keep you logged in and
              connected to your games. With your consent, we also use analytics
              cookies, and rev.iq uses advertising cookies to help keep
              Talishar free.
            </p>
          ) : (
            <div className={styles.expandedContent}>
              <p className={styles.description}>
                <strong>Essential Cookies (always active):</strong> Required
                for Talishar to work. They store your login session, your
                &quot;Remember Me&quot; token if you use it, and the
                authorization key that proves you are a player in your current
                game. Declining below does <strong>not</strong> disable these
                — but if you block all cookies in your browser settings, you
                may be disconnected mid-game, unable to rejoin, and forced to
                log in again between games.
              </p>
              <p className={styles.description}>
                <strong>Analytics Cookies (only with your consent):</strong>{' '}
                We use Google Analytics to understand how visitors interact
                with the site. These cookies are only set if you choose
                &quot;Accept All Cookies&quot;.
              </p>
              <p className={styles.description}>
                <strong>Advertising Cookies:</strong> rev.iq and its partners
                use cookies to serve ads based on your visits to our site and
                other sites. Ads keep Talishar free to use, so they are shown
                to all non-supporter accounts. You can opt out of personalized
                ads anytime via{' '}
                <a
                  href="https://www.rev.iq/optout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  rev.iq Ad Settings
                </a>
                .
              </p>
              <p className={styles.description}>
                You can change your choice anytime from the{' '}
                <Link to="/privacy">Privacy page</Link> or through your browser
                settings.
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
            Decline Analytics
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
