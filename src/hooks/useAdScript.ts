import { useEffect } from 'react';

const AD_SELECTORS =
  '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
  'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
  '[data-ad-can-shrink], [data-ad="anchor"]';

// Selector for RevIQ auto-injected elements we never explicitly place
const AUTO_INJECT_SELECTORS = '[data-ad-can-shrink], [data-ad="anchor"]';

function purgeAdElements() {
  // Remove Rev.IQ ad scripts
  document
    .querySelectorAll('script[src*="rev.iq"]')
    .forEach((el) => el.remove());

  // Remove ad containers and iframes
  document.querySelectorAll(AD_SELECTORS).forEach((el) => el.remove());
}

function purgeAutoInjected() {
  document.querySelectorAll(AUTO_INJECT_SELECTORS).forEach((el) => el.remove());
}

export default function useAdScript(enabled: boolean = true, { suppressAnchor = false }: { suppressAnchor?: boolean } = {}) {
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
              node.src.includes('rev.iq')
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

    if (!suppressAnchor) {
      return () => {
        purgeAdElements();
      };
    }

    // Block RevIQ's auto-injected anchor/sticky ads — we only want explicitly
    // placed div[data-ad] slots, not automatic bottom bars RevIQ inserts itself.
    purgeAutoInjected();
    const anchorObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches?.(AUTO_INJECT_SELECTORS)) {
            node.remove();
            continue;
          }
          node.querySelectorAll?.(AUTO_INJECT_SELECTORS)?.forEach((el) => el.remove());
        }
      }
    });

    anchorObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => {
      anchorObserver.disconnect();
      purgeAdElements();
    };
  }, [enabled, suppressAnchor]);
}
