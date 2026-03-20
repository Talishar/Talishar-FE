import { useEffect } from 'react';

export default function useAdScript(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const script = document.createElement('script');
    script.src = '//js.rev.iq/talishar.net';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Remove any ad containers/iframes the Rev.IQ script appended to the DOM
      document
        .querySelectorAll(
          '[id^="rev-"], [class*="rev-content"], [class*="revcontent"], iframe[src*="rev.iq"], iframe[src*="revcontent"], div[data-ad]'
        )
        .forEach((el) => el.remove());
    };
  }, [enabled]);
}
