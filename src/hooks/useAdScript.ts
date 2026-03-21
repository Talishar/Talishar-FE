import { useEffect } from 'react';

const AD_SELECTORS =
  '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
  'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
  'div[data-ad], ins.adsbygoogle,' +
  '[id*="google_ads"], [id*="gpt-ad"], [id*="aswift"],' +
  'iframe[id*="google_ads"], iframe[src*="googlesyndication"],' +
  'div[id*="adsense"], div[class*="google-ad"],' +
  '[id="google_vignette"], [id*="vignette"], div[id^="google_ads_iframe"]';

function purgeAdElements() {
  // Remove Rev.IQ and Google ad scripts
  document
    .querySelectorAll('script[src*="rev.iq"], script[src*="googlesyndication"], script[src*="adsbygoogle"]')
    .forEach((el) => el.remove());

  // Remove ad containers, iframes, and Google vignette/interstitial overlays
  document.querySelectorAll(AD_SELECTORS).forEach((el) => el.remove());

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

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.matches?.(AD_SELECTORS)) {
              node.remove();
              continue;
            }
            if (
              node.tagName === 'SCRIPT' &&
              node instanceof HTMLScriptElement &&
              (node.src.includes('rev.iq') ||
                node.src.includes('googlesyndication') ||
                node.src.includes('adsbygoogle'))
            ) {
              node.remove();
              continue;
            }
            node.querySelectorAll?.(AD_SELECTORS)?.forEach((el) => el.remove());
          }
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      const intervalId = window.setInterval(purgeAdElements, 2000);

      return () => {
        observer.disconnect();
        window.clearInterval(intervalId);
      };
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
