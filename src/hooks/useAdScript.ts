import { useEffect } from 'react';

const AD_SELECTORS =
  '[id^="rev-"], [class*="rev-content"], [class*="revcontent"],' +
  'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
  '[id^="reviq-"], [id^="prims_"], [id^="primis"], [class*="primis"],' +
  'div[data-ad]';

// Hosts that are allowed to receive top-level navigation.
// Relative URLs (no host) are always trusted.
const TRUSTED_HOST_RE =
  /^(localhost|127\.\d+\.\d+\.\d+|talishar\.net|[a-z0-9-]+\.talishar\.net|metafy\.gg|[a-z0-9-]+\.rev\.iq|[a-z0-9-]+\.revcontent\.com|[a-z0-9-]+\.googlesyndication\.com|[a-z0-9-]+\.doubleclick\.net)$/i;

const BLOCKED_HASHES = ['#goog_rewarded', '#google_vignette'];

function isTrustedNavigation(rawUrl: string): boolean {
  if (!rawUrl) return true;
  if (rawUrl.startsWith('javascript:')) return false;
  if (rawUrl.startsWith('/') || rawUrl.startsWith('?')) return true;
  if (rawUrl.startsWith('#')) {
    return !BLOCKED_HASHES.some((h) => rawUrl.startsWith(h));
  }
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

// React attaches __reactFiber$xxx to every DOM node it manages, including
// portal nodes that land outside #root. Skip those so we don't break game UI
// (e.g. PlayerHand portals to document.body).
function isReactPortalEl(el: Element): boolean {
  const keys = Object.keys(el);
  for (const key of keys) {
    if (key.startsWith('__reactFiber') || key.startsWith('__reactProps')) return true;
  }
  return false;
}

function lockNonRootBodyChildren() {
  if (!document.body) return;
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'root') continue;
    if (isReactPortalEl(el)) continue;
    const h = el as HTMLElement;
    h.style.setProperty('pointer-events', 'none', 'important');
    // <ins> elements are Google's GPT slot containers. Hide them entirely so
    // interstitial ads can't visually cover the page. pointer-events alone
    // only stops clicks — it doesn't prevent the ad from rendering on top.
    if (h.tagName === 'INS') {
      h.style.setProperty('visibility', 'hidden', 'important');
    }
    h.querySelectorAll<HTMLElement>('*').forEach((child) => {
      child.style.setProperty('pointer-events', 'none', 'important');
    });
  }
}

function unlockNonRootBodyChildren() {
  if (!document.body) return;
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'root') continue;
    const h = el as HTMLElement;
    h.style.removeProperty('pointer-events');
    h.style.removeProperty('visibility');
    h.querySelectorAll<HTMLElement>('*').forEach((child) => {
      child.style.removeProperty('pointer-events');
    });
  }
}

// Expose so index.html's _talishar_showRewarded can unlock/re-lock around the ad.
(window as any)._talishar_lockOverlays = lockNonRootBodyChildren;
(window as any)._talishar_unlockOverlays = unlockNonRootBodyChildren;

// Google's rewarded ad SDK scans all <button> elements on the page and injects
// data-google-rewarded="true" on them, causing any button click to trigger the
// rewarded ad. Strip these attributes from every element except #clearRust.
const REWARDED_ATTRS = ['data-google-rewarded', 'data-google-interstitial'];

function stripRewardedAttrsFrom(el: Element) {
  if (el.id === 'clearRust') return;
  for (const attr of REWARDED_ATTRS) {
    if (el.hasAttribute(attr)) el.removeAttribute(attr);
  }
}

function sweepRewardedAttrs(root: Document | Element = document) {
  const scope = root === document ? document.body : (root as Element);
  if (!scope) return;
  for (const attr of REWARDED_ATTRS) {
    scope.querySelectorAll(`[${attr}]`).forEach((el) => {
      if (el.id !== 'clearRust') el.removeAttribute(attr);
    });
  }
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

    if (!document.querySelector('script[src="//js.rev.iq/talishar.net"]')) {
      try {
        (window as any).googletag?.destroySlots?.();
      } catch (_) {}

      const script = document.createElement('script');
      script.src = '//js.rev.iq/talishar.net';
      script.async = true;
      document.head.appendChild(script);
    }

    // Sandbox any ad iframes already present and watch for new ones.
    sandboxAdIframesIn(document);

    // Strip data-google-rewarded from everything except #clearRust on load,
    // then watch for the SDK re-injecting it.
    sweepRewardedAttrs();

    // Immediately lock any non-root body children, then enforce every 150ms.
    lockNonRootBodyChildren();
    const overlayInterval = window.setInterval(lockNonRootBodyChildren, 150);

    const domGuard = new MutationObserver((mutations) => {
      let newBodyChild = false;
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          stripRewardedAttrsFrom(mutation.target as Element);
        } else {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            stripRewardedAttrsFrom(node);
            sweepRewardedAttrs(node);
            // Only re-lock when something lands directly on body — React's
            // constant in-game DOM updates inside #root must not trigger this.
            if (node.parentElement === document.body) newBodyChild = true;
          }
        }
      }
      if (newBodyChild) lockNonRootBodyChildren();
    });
    domGuard.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: REWARDED_ATTRS
    });

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
      window.clearInterval(overlayInterval);
      domGuard.disconnect();
      iframeGuard.disconnect();
      removeNavGuard();
    };
  }, [enabled]);
}
