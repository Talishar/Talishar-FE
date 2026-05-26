import { useEffect } from 'react';

const AD_SELECTORS =
  '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
  'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
  'div[data-ad]';

// Hosts that are allowed to receive top-level navigation.
// Relative URLs (no host) are always trusted.
const TRUSTED_HOST_RE =
  /^(localhost|127\.\d+\.\d+\.\d+|talishar\.net|[a-z0-9-]+\.talishar\.net|metafy\.gg|[a-z0-9-]+\.rev\.iq|[a-z0-9-]+\.revcontent\.com|[a-z0-9-]+\.googlesyndication\.com|[a-z0-9-]+\.doubleclick\.net)$/i;

function isTrustedNavigation(rawUrl: string): boolean {
  if (!rawUrl) return true;
  if (rawUrl.startsWith('/') || rawUrl.startsWith('#') || rawUrl.startsWith('?')) return true;
  if (rawUrl.startsWith('javascript:')) return false;
  try {
    const url = new URL(rawUrl, window.location.href);
    if (url.origin === window.location.origin) return true;
    return TRUSTED_HOST_RE.test(url.hostname);
  } catch {
    return true;
  }
}

let navGuardInstalled = false;
let savedHrefDescriptor: PropertyDescriptor | null = null;
let savedAssignDescriptor: PropertyDescriptor | null = null;
let savedReplaceDescriptor: PropertyDescriptor | null = null;

function installNavGuard() {
  if (navGuardInstalled) return;

  const locProto = window.Location.prototype;

  savedHrefDescriptor = Object.getOwnPropertyDescriptor(locProto, 'href') ?? null;
  if (savedHrefDescriptor?.set) {
    const origSet = savedHrefDescriptor.set;
    try {
      Object.defineProperty(locProto, 'href', {
        get: savedHrefDescriptor.get,
        set(url: string) {
          if (isTrustedNavigation(url)) {
            origSet.call(this, url);
          } else {
            console.warn('[Talishar] Ad guard blocked navigation to:', url);
          }
        },
        configurable: true,
        enumerable: savedHrefDescriptor.enumerable
      });
    } catch (_) {}
  }

  savedAssignDescriptor = Object.getOwnPropertyDescriptor(locProto, 'assign') ?? null;
  if (savedAssignDescriptor?.value) {
    const origAssign = savedAssignDescriptor.value;
    try {
      Object.defineProperty(locProto, 'assign', {
        value(this: Location, url: string) {
          if (isTrustedNavigation(url)) origAssign.call(this, url);
          else console.warn('[Talishar] Ad guard blocked assign to:', url);
        },
        configurable: true,
        writable: savedAssignDescriptor.writable,
        enumerable: savedAssignDescriptor.enumerable
      });
    } catch (_) {}
  }

  savedReplaceDescriptor = Object.getOwnPropertyDescriptor(locProto, 'replace') ?? null;
  if (savedReplaceDescriptor?.value) {
    const origReplace = savedReplaceDescriptor.value;
    try {
      Object.defineProperty(locProto, 'replace', {
        value(this: Location, url: string) {
          if (isTrustedNavigation(url)) origReplace.call(this, url);
          else console.warn('[Talishar] Ad guard blocked replace to:', url);
        },
        configurable: true,
        writable: savedReplaceDescriptor.writable,
        enumerable: savedReplaceDescriptor.enumerable
      });
    } catch (_) {}
  }

  navGuardInstalled = true;
}

function removeNavGuard() {
  if (!navGuardInstalled) return;

  const locProto = window.Location.prototype;

  if (savedHrefDescriptor) {
    try {
      Object.defineProperty(locProto, 'href', savedHrefDescriptor);
    } catch (_) {}
    savedHrefDescriptor = null;
  }

  if (savedAssignDescriptor) {
    try {
      Object.defineProperty(locProto, 'assign', savedAssignDescriptor);
    } catch (_) {}
    savedAssignDescriptor = null;
  }

  if (savedReplaceDescriptor) {
    try {
      Object.defineProperty(locProto, 'replace', savedReplaceDescriptor);
    } catch (_) {}
    savedReplaceDescriptor = null;
  }

  navGuardInstalled = false;
}

function purgeAdElements() {
  document
    .querySelectorAll('script[src*="rev.iq"]')
    .forEach((el) => el.remove());
  document.querySelectorAll(AD_SELECTORS).forEach((el) => el.remove());
}

// Sandbox an iframe from an ad network so it cannot navigate the top frame.
// allow-popups-to-escape-sandbox lets ad clicks open a new tab normally.
// Deliberately omits allow-top-navigation.
function sandboxAdIframe(iframe: HTMLIFrameElement) {
  if (iframe.hasAttribute('data-ad-sandboxed')) return;
  const src = iframe.src || iframe.getAttribute('src') || '';
  const isAdFrame =
    src.includes('rev.iq') ||
    src.includes('revcontent') ||
    iframe.id.startsWith('rev-') ||
    iframe.closest('[data-ad]') !== null ||
    iframe.closest('[id^="rev-"]') !== null;
  if (!isAdFrame) return;
  iframe.setAttribute(
    'sandbox',
    'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms'
  );
  iframe.setAttribute('data-ad-sandboxed', '1');
}

function sandboxAdIframesIn(root: Document | Element) {
  const container = root === document ? document.body : (root as Element);
  container?.querySelectorAll?.('iframe').forEach((el) =>
    sandboxAdIframe(el as HTMLIFrameElement)
  );
}

export default function useAdScript(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) {
      removeNavGuard();
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

    // Install navigation guard before injecting the ad script so any redirect
    // attempts from the ad network are blocked from the moment the script runs.
    installNavGuard();

    try {
      (window as any).googletag?.destroySlots?.();
    } catch (_) {}

    if (!document.querySelector('script[src="//js.rev.iq/talishar.net"]')) {
      const script = document.createElement('script');
      script.src = '//js.rev.iq/talishar.net';
      script.async = true;
      document.head.appendChild(script);
    }

    if (!document.querySelector('[data-ad="video"]')) {
      const videoDiv = document.createElement('div');
      videoDiv.setAttribute('data-ad', 'video');
      document.body.appendChild(videoDiv);
    }

    function clipOverlayToBottom(el: HTMLElement) {
      requestAnimationFrame(() => {
        const cs = window.getComputedStyle(el);
        if (
          cs.position === 'fixed' &&
          cs.top === '0px' &&
          parseFloat(cs.width) > window.innerWidth * 0.5
        ) {
          el.style.setProperty('clip-path', 'inset(50% 0 0 0)', 'important');
        }
      });
    }

    const adOverlayGuard = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          clipOverlayToBottom(node);
          node.querySelectorAll('div').forEach((child) =>
            clipOverlayToBottom(child as HTMLElement)
          );
        }
      }
    });
    adOverlayGuard.observe(document.body, { childList: true });

    // Sandbox any ad iframes already present and watch for new ones.
    sandboxAdIframesIn(document);
    const iframeGuard = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLIFrameElement) {
            sandboxAdIframe(node);
          } else if (node instanceof HTMLElement) {
            sandboxAdIframesIn(node);
          }
        }
      }
    });
    iframeGuard.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      iframeGuard.disconnect();
      adOverlayGuard.disconnect();
      removeNavGuard();
      purgeAdElements();
    };
  }, [enabled]);
}
