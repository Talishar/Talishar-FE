import { useEffect } from 'react';

function purgeAdElements() {
  document
    .querySelectorAll('script[src*="rev.iq"]')
    .forEach((el) => el.remove());

  document
    .querySelectorAll(
      '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
      'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
      'div[data-ad], ins.adsbygoogle,' +
      '[id*="google_ads"], [id*="gpt-ad"], [id*="aswift"],' +
      'iframe[id*="google_ads"], iframe[src*="googlesyndication"],' +
      'div[id*="adsense"], div[class*="google-ad"]'
    )
    .forEach((el) => el.remove());

  try {
    (window as any).adsbygoogle = { push: () => {} };
  } catch (_) {
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
