// AdSense initialization utility
// This file manages Google AdSense initialization with proper consent and COPPA compliance

const isProduction = import.meta.env.PROD;

// Mock AdSense for local development (avoids CORS issues)
const createMockAdSense = () => {
  return {
    push: (config: any) => {
      // Find and populate all ad containers immediately and repeatedly
      const injectMockAds = () => {
        const adContainers = document.querySelectorAll('.adsbygoogle[data-ad-slot]');
        
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
    return;
  }

  // In development, use mock AdSense to avoid CORS issues
  if (!isProduction) {
    if (!window.adsbygoogle) {
      (window as any).adsbygoogle = createMockAdSense();
    }
    return;
  }

  // Script is loaded from index.html in production, just ensure adsbygoogle array exists
  if (!window.adsbygoogle) {
    (window as any).adsbygoogle = [];
  }

  // Push any pending ads
  try {
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
    console.log('Google AdSense initialized successfully.');
  } catch (error) {
    console.warn('AdSense initialization error:', error);
  }
};

// Function to check if AdSense should be loaded
export const shouldLoadAds = (): boolean => {
  const consentStatus = localStorage.getItem('cookieConsent');
  return consentStatus === 'accepted';
};
