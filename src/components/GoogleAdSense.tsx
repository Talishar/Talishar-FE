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

  useEffect(() => {
    // Try to push ad to adsbygoogle
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }

    // Detect ad blocker - check if ads script loaded and if ad rendered
    const checkAdBlocker = setTimeout(() => {
      // Check if Google's ad script is blocked or unavailable
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
          // No iframe means ad failed to load (blocked, ad blocker, CORS, or error)
          setAdBlocked(true);
        }
      } else {
        // Container doesn't exist, mark as blocked
        setAdBlocked(true);
      }
    }, 3500);

    return () => clearTimeout(checkAdBlocker);
  }, [slot]);

  // Hide ads for Patreon members
  if (isPatron) {
    return null;
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
            href="https://www.patreon.com/Talishar"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF424D', textDecoration: 'none' }}
          >
            Support Talishar on Patreon
          </a>{' '}
          to hide ads and more!
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
