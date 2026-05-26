import { useEffect } from 'react';

const AD_SELECTORS =
  '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
  'script[src*="rev.iq"]';

function purgeTopDocumentAdScripts() {
  document.querySelectorAll(AD_SELECTORS).forEach((el) => el.remove());
}

export default function useAdScript(_enabled: boolean = true) {
  useEffect(() => {
    purgeTopDocumentAdScripts();
  }, []);
}
