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

  // Check for cookie consent on mount and when it changes
  useEffect(() => {
    const consentStatus = localStorage.getItem('cookieConsent');
    setHasConsent(consentStatus === 'accepted');

    // Listen for storage changes (when consent is set in another component)
    const handleStorageChange = () => {
      const updatedConsent = localStorage.getItem('cookieConsent');
      setHasConsent(updatedConsent === 'accepted');
      console.log('✅ Cookie consent changed:', updatedConsent);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Don't load ads if user hasn't consented or declined personalized ads
    if (hasConsent === null || hasConsent === false) {
      console.log('AdSense: Not loading - consent status:', hasConsent);
      return;
    }

    // Try to push ad to adsbygoogle
    try {
      if (window.adsbygoogle) {
        console.log('AdSense: Pushing ad to adsbygoogle array');
        window.adsbygoogle.push({});
      } else {
        // Script not loaded, show fallback immediately
        console.warn('AdSense: Script not loaded yet, waiting...');
        const timer = setTimeout(() => {
          if (!window.adsbygoogle) {
            console.warn('AdSense: Script still not available after 500ms');
            setAdBlocked(true);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('AdSense error (may be due to ad blocker or CORS restrictions):', error);
      // On error, show fallback
      setAdBlocked(true);
    }

    // Also check with a longer timeout in case script is slow to load
    const checkAdBlocker = setTimeout(() => {
      // If still no adsbygoogle, it's blocked or failed to load
      if (!window.adsbygoogle) {
        console.warn('AdSense: Script not available after 3s. Likely blocked or failed to load.');
        setAdBlocked(true);
        return;
      }

      // Check if ad container exists and has content (mock or real)
      const adContainer = document.querySelector(`.adsbygoogle[data-ad-slot="${slot}"]`);
      console.log(`📦 Ad container for slot ${slot}:`, adContainer ? 'Found ✅' : 'Not found ❌');
      
      if (adContainer) {
        // Check for iframe (real ad) or mock ad indicator
        const hasIframe = adContainer.querySelector('iframe');
        const hasMockAd = adContainer.querySelector('[data-mock-ad]');
        
        console.log(`   Has iframe: ${!!hasIframe}, Has mock ad: ${!!hasMockAd}`);
        
        if (hasIframe) {
          console.log('AdSense: Real ad rendered successfully!');
        } else if (hasMockAd) {
          console.log('AdSense: Mock ad rendered for development!');
        } else {
          // No iframe or mock means ad failed to load
          console.warn('AdSense: Ad container exists but no content. Ad may still be loading...');
          // Don't mark as blocked - ads take time to render
        }
      } else {
        // Container doesn't exist, mark as blocked
        console.warn('AdSense: Ad container not found in DOM');
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
