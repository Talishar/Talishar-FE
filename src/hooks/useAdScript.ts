import { useEffect } from 'react';

function purgeAdElements() {
  // Remove Rev.IQ and Google ad scripts
  document
    .querySelectorAll('script[src*="rev.iq"], script[src*="googlesyndication"], script[src*="adsbygoogle"]')
    .forEach((el) => el.remove());

  // Remove ad containers, iframes, and Google vignette/interstitial overlays
  document
    .querySelectorAll(
      '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
      'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
      'div[data-ad], ins.adsbygoogle,' +
      '[id*="google_ads"], [id*="gpt-ad"], [id*="aswift"],' +
      'iframe[id*="google_ads"], iframe[src*="googlesyndication"],' +
      'div[id*="adsense"], div[class*="google-ad"],' +
      '[id="google_vignette"], [id*="vignette"], div[id^="google_ads_iframe"]'
    )
    .forEach((el) => el.remove());

  // Strip #google_vignette from the URL without triggering a navigation
  if (window.location.hash === '#google_vignette') {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // Neutralise adsbygoogle so any queued push() calls silently no-op
  try {
    (window as any).adsbygoogle = { push: () => {} };
  } catch (_) {
    // ignore
  }
}

export default function useAdScript(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) {
      purgeAdElements();
      return;
    }

    const script = document.createElement('script');
    script.src = '//js.rev.iq/talishar.net';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      purgeAdElements();
    };
  }, [enabled]);
}
