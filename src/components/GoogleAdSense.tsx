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
    const updateConsent = () => {
      const consentStatus = localStorage.getItem('cookieConsent');
      const accepted = consentStatus === 'accepted';
      console.log('🔍 Checking consent status:', consentStatus, '- Accepted:', accepted);
      setHasConsent(accepted);
    };

    // Initial check
    updateConsent();

    // Listen for storage changes (when consent is set in another tab or programmatically dispatched)
    window.addEventListener('storage', updateConsent);
    
    return () => window.removeEventListener('storage', updateConsent);
  }, []);

  useEffect(() => {
    // Don't load ads if user hasn't consented or declined personalized ads
    if (hasConsent === null) {
      console.log('📋 AdSense: Waiting for consent decision (consent is null)');
      return;
    }

    if (hasConsent === false) {
      console.log('❌ AdSense: Not loading - user declined personalized ads');
      return;
    }

    console.log('✅ AdSense: User has consented, attempting to load ads');

    // Try to push ad to adsbygoogle
    if (!window.adsbygoogle) {
      console.warn('⚠️ AdSense: window.adsbygoogle not found - script may not have loaded');
    } else {
      try {
        console.log('📤 AdSense: Pushing ad to adsbygoogle array');
        window.adsbygoogle.push({});
      } catch (error) {
        console.warn('⚠️ AdSense: Error pushing to array:', error);
      }
    }

    // Check with a timeout to see if ad loaded
    const checkAdLoadTimer = setTimeout(() => {
      const adContainer = document.querySelector(`.adsbygoogle[data-ad-slot="${slot}"]`);
      
      if (!adContainer) {
        console.warn(`❌ AdSense: Ad container not found for slot ${slot}`);
        setAdBlocked(true);
        return;
      }

      console.log(`✅ AdSense: Ad container found for slot ${slot}`);

      // Check for iframe (real ad) or mock ad indicator
      const hasIframe = !!adContainer.querySelector('iframe');
      const hasMockAd = !!adContainer.querySelector('[data-mock-ad]');

      console.log(`   📊 Status - Has iframe: ${hasIframe}, Has mock ad: ${hasMockAd}`);

      if (hasIframe) {
        console.log('🎉 AdSense: Real ad rendered successfully!');
      } else if (hasMockAd) {
        console.log('🎨 AdSense: Mock ad rendered for development!');
      } else {
        console.warn('⚠️ AdSense: Ad container exists but no content rendered. Showing fallback...');
        setAdBlocked(true);
      }
    }, 3000);

    return () => clearTimeout(checkAdLoadTimer);
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
