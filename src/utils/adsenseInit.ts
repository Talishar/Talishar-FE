// AdSense initialization utility
// This file manages Google AdSense script loading with proper consent and COPPA compliance

export const initializeAdSense = () => {
  // Check if user has consented to cookies
  const consentStatus = localStorage.getItem('cookieConsent');
  
  // Only load AdSense if user has explicitly accepted
  if (consentStatus !== 'accepted') {
    return;
  }

  // Check if script is already loaded
  if (window.adsbygoogle) {
    return;
  }

  // Load AdSense script dynamically
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8442966023291783';
  script.async = true;
  script.crossOrigin = 'anonymous';
  
  // Add COPPA compliance: site is not directed at children
  script.setAttribute('data-ad-frequency-hint', '30s');
  
  // Add error handling for script load failures
  script.onerror = () => {
    console.warn('Failed to load Google AdSense script. This may be due to ad blockers or network issues.');
  };
  
  script.onload = () => {
    console.log('Google AdSense script loaded successfully.');
  };
  
  document.head.appendChild(script);

  // Initialize adsbygoogle array if it doesn't exist
  if (!window.adsbygoogle) {
    (window as any).adsbygoogle = [];
  }
};

// Function to check if AdSense should be loaded
export const shouldLoadAds = (): boolean => {
  const consentStatus = localStorage.getItem('cookieConsent');
  return consentStatus === 'accepted';
};
