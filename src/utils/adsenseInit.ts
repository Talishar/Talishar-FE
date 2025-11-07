// AdSense initialization utility
// This file manages Google AdSense initialization with proper consent and COPPA compliance

const isProduction = import.meta.env.PROD;

// Mock AdSense for local development (avoids CORS issues)
const createMockAdSense = () => {
  return {
    push: (config: any) => {
      console.log('Mock AdSense: Ad pushed with config:', config);
      // Find and populate all ad containers immediately and repeatedly
      const injectMockAds = () => {
        const adContainers = document.querySelectorAll('.adsbygoogle[data-ad-slot]');
        console.log(`Mock AdSense: Found ${adContainers.length} ad containers`);
        
        adContainers.forEach((container: Element) => {
          // Only inject if not already injected
          if (!container.querySelector('[data-mock-ad]')) {
            const mockAd = document.createElement('div');
            mockAd.setAttribute('data-mock-ad', 'true');
            mockAd.style.cssText = `
              border: 2px dashed #999;
              padding: 20px;
              margin: 10px 0;
              background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
              color: #666;
              text-align: center;
              font-size: 14px;
              border-radius: 4px;
              font-family: system-ui, -apple-system, sans-serif;
            `;
            mockAd.innerHTML = `
              <strong style="display: block; margin-bottom: 8px;">📢 Advertisement Space</strong>
              <small style="display: block; margin-bottom: 4px;">Slot: ${(container as any).dataset?.adSlot || 'N/A'}</small>
              <small style="color: #999;">(Mock - Real Google Ads in production)</small>
            `;
            container.appendChild(mockAd);
            console.log(`Mock AdSense: Injected ad for slot ${(container as any).dataset?.adSlot}`);
          }
        });
      };
      
      // Try immediately
      injectMockAds();
      
      // Retry a few times in case containers appear later
      for (let i = 1; i <= 5; i++) {
        setTimeout(injectMockAds, i * 100);
      }
    },
  };
};

export const initializeAdSense = () => {
  // Check if user has consented to cookies
  const consentStatus = localStorage.getItem('cookieConsent');
  
  // Only initialize AdSense if user has explicitly accepted
  if (consentStatus !== 'accepted') {
    console.log('🔒 AdSense: User has not accepted cookies');
    return;
  }

  // In development, use mock AdSense to avoid CORS issues
  if (!isProduction) {
    if (!window.adsbygoogle) {
      (window as any).adsbygoogle = createMockAdSense();
    }
    console.log('🚀 Mock AdSense initialized for local development.');
    return;
  }

  // Production: Load Google AdSense script dynamically
  console.log('📡 Production mode: Loading Google AdSense script...');

  // Pre-initialize array if not already done
  if (!window.adsbygoogle) {
    (window as any).adsbygoogle = [];
  }

  // Check if script is already loaded
  if ((window as any).adsbygoogleLoaded) {
    console.log('✅ AdSense script already loaded');
    return;
  }

  // Strategy: Load via local proxy first (bypasses CORS), then fall back to direct Google CDN
  
  const loadDirectGoogle = () => {
    console.log('� Loading Google AdSense directly from CDN...');
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.setAttribute('data-ad-client', 'ca-pub-8442966023291783');
    
    script.onload = () => {
      console.log('✅ Google AdSense loaded successfully from CDN');
      (window as any).adsbygoogleLoaded = true;
      
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        try {
          window.adsbygoogle.push({});
        } catch (e) {
          console.log('Ad processing queued');
        }
      }
    };

    script.onerror = () => {
      console.warn('❌ Failed to load from Google CDN');
      (window as any).adsbygoogleLoaded = false;
    };

    document.head.appendChild(script);
  };

  // Primary approach: Load via local proxy (same-domain, no CORS issues)
  console.log('� Loading AdSense via local proxy at /adsbygoogle.js...');
  const proxyScript = document.createElement('script');
  proxyScript.async = true;
  proxyScript.src = '/adsbygoogle.js';
  
  proxyScript.onload = () => {
    console.log('✅ AdSense proxy loaded successfully');
    (window as any).adsbygoogleLoaded = true;
  };

  proxyScript.onerror = () => {
    console.warn('❌ Failed to load AdSense proxy, falling back to direct Google CDN...');
    (window as any).adsbygoogleLoaded = false;
    // Fallback to direct Google after brief delay
    setTimeout(loadDirectGoogle, 500);
  };

  // Set timeout as additional failsafe
  setTimeout(() => {
    if (!(window as any).adsbygoogleLoaded && !document.querySelector('script[src="/adsbygoogle.js"]')) {
      console.warn('⏱️ Proxy load timeout, attempting direct Google CDN...');
      loadDirectGoogle();
    }
  }, 3000);

  document.head.appendChild(proxyScript);
};

// Function to check if AdSense should be loaded
export const shouldLoadAds = (): boolean => {
  const consentStatus = localStorage.getItem('cookieConsent');
  return consentStatus === 'accepted';
};

