/**
 * AdSense Proxy Script - Served from talishar.net/adsbygoogle.js
 * This proxies Google AdSense to avoid CORS/firewall issues
 */

(function() {
  'use strict';

  console.log('✅ AdSense Proxy loaded from talishar.net/adsbygoogle.js');

  // Initialize the adsbygoogle array if not already done
  if (!window.adsbygoogle) {
    window.adsbygoogle = [];
  }

  // Mark proxy as loaded
  window.adsbygoogleProxyLoaded = true;

  // Store the array's original push method
  const adsbygoogleArray = window.adsbygoogle;
  let originalPush = adsbygoogleArray.push;

  // Override the push method to handle ad slots
  window.adsbygoogle.push = function(config) {
    if (originalPush) {
      originalPush.call(this, config);
    } else {
      Array.prototype.push.call(this, config);
    }

    // Process ads when pushed
    processAds();
  };

  function processAds() {
    if (!document.querySelectorAll) return;

    const adsbygoogleIns = document.querySelectorAll('.adsbygoogle[data-ad-slot]');
    adsbygoogleIns.forEach(function(ins) {
      if (ins.getAttribute('data-ad-client') && !ins.getAttribute('data-ad-processed')) {
        ins.setAttribute('data-ad-processed', 'true');
        console.log('📢 Ad slot queued:', ins.getAttribute('data-ad-slot'));
      }
    });
  }

  // Load the real Google AdSense script
  if (!window.adsbygoogleLoaded && !document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
    console.log('📡 Loading real Google AdSense script via proxy...');

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.setAttribute('data-ad-client', 'ca-pub-8442966023291783');

    script.onload = function() {
      console.log('✅ Real Google AdSense script loaded successfully');
      window.adsbygoogleLoaded = true;

      // Process any ads that were already queued
      processAds();

      // Re-push queued configs
      if (adsbygoogleArray.length > 0) {
        try {
          window.adsbygoogle.push({});
        } catch (e) {
          console.log('Ad processing initiated');
        }
      }
    };

    script.onerror = function() {
      console.warn('⚠️ Failed to load real Google AdSense, but proxy is active');
      window.adsbygoogleLoaded = false;
    };

    // Delay to ensure proxy is fully set up
    setTimeout(function() {
      if (document.head) {
        document.head.appendChild(script);
      }
    }, 100);
  } else if (window.adsbygoogleLoaded) {
    console.log('✅ Google AdSense already loaded');
  }

  // Mark as loaded
  window.adsbygoogleLoaded = window.adsbygoogleLoaded || true;
  console.log('✅ AdSense proxy fully initialized');
})();
