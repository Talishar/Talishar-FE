import React, { useEffect, useState } from 'react';
import useAuth from 'hooks/useAuth';

interface GoogleAdSenseProps {
  client?: string;
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}) => {
  const { isPatron } = useAuth();
  const [adBlocked, setAdBlocked] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  // Check for cookie consent on mount
  useEffect(() => {
    const consentStatus = localStorage.getItem('cookieConsent');
    setHasConsent(consentStatus === 'accepted');
  }, []);

  useEffect(() => {
    // Don't load ads if user hasn't consented or declined personalized ads
    if (hasConsent === null || hasConsent === false) {
      return;
    }

    // Try to push ad to adsbygoogle
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      } else {
        // Script not loaded, show fallback immediately
        const timer = setTimeout(() => setAdBlocked(true), 500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('AdSense error:', error);
      // On error, show fallback
      setAdBlocked(true);
    }

    // Also check with a longer timeout in case script is slow to load
    const checkAdBlocker = setTimeout(() => {
      // If still no adsbygoogle, it's blocked
      if (!window.adsbygoogle) {
        setAdBlocked(true);
        return;
      }

      // Check if ad container exists and has content
      const adContainer = document.querySelector(`.adsbygoogle[data-ad-slot="${slot}"]`);
      if (adContainer) {
        // Check for iframe - this means ad successfully rendered
        const hasIframe = adContainer.querySelector('iframe');
        if (!hasIframe) {
          // No iframe means ad failed to load
          setAdBlocked(true);
        }
      } else {
        // Container doesn't exist, mark as blocked
        setAdBlocked(true);
      }
    }, 3000);

    return () => clearTimeout(checkAdBlocker);
  }, [slot, hasConsent]);

  // Hide ads for Patreon members
  if (isPatron) {
    return null;
  }

  // Don't show ads until user makes a choice about cookies
  if (hasConsent === null) {
    return null;
  }

  // If user declined personalized ads, show non-personalized ad placeholder
  if (hasConsent === false) {
    return (
      <div
        style={{
          padding: '12px',
          marginTop: '20px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#999',
        }}
      >
        <p style={{ margin: 0 }}>
          Ads disabled due to cookie preferences.{' '}
          <a
            href="https://linktr.ee/Talishar"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF424D', textDecoration: 'none' }}
          >
            Support Talishar on Patreon
          </a>{' '}
          to support the site!
        </p>
      </div>
    );
  }

  // Show ad blocker message
  if (adBlocked) {
    return (
      <div
        style={{
          padding: '12px',
          marginTop: '20px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#999',
        }}
      >
        <p style={{ margin: 0 }}>
          <a
            href="https://linktr.ee/Talishar"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF424D', textDecoration: 'none' }}
          >
            Support Talishar on Patreon
          </a>{' '}
          to hide ads and enjoy more features!
        </p>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-8442966023291783"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
};

export default GoogleAdSense;
