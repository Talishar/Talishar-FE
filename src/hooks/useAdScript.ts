import { useEffect } from 'react';
import { ADS_ENABLED, isAdFreeRoute } from 'config/ads';
import { startAdAnalytics } from 'utils/adAnalytics';

declare global {
  interface Window {
    __talisharAdProviderLoaded?: boolean;
  }
}

const AD_SELECTORS =
  '[id^="rev-"]:not(#rev-adblock-api), [class*="rev-content"], [class*="revcontent"],' +
  'iframe[src*="rev.iq"], iframe[src*="revcontent"],' +
  '[id^="reviq-"], [id^="prims_"], [id^="primis"], [class*="primis"],' +
  'div[data-ad]';

// Hosts allowed to take over the tab. Everything else Talishar links to opens
// in a new tab, and so should ad clicks.
const TRUSTED_HOST_RE =
  /^(localhost|127\.\d+\.\d+\.\d+|(?:[a-z0-9-]+\.)*talishar\.net|metafy\.gg|(?:www\.)?patreon\.com|(?:www\.)?fablazing\.com)$/i;

interface NavigateEventLike extends Event {
  readonly userInitiated: boolean;
  readonly destination: { readonly url: string };
}

function isTrustedDestination(url: URL): boolean {
  if (url.protocol === 'blob:' || url.protocol === 'data:') return false;
  return (
    url.origin === window.location.origin || TRUSTED_HOST_RE.test(url.hostname)
  );
}

// Location's href/assign/replace are unforgeable and cannot be wrapped. The
// Navigation API sees every top-level navigation started by this document or a
// same-origin (friendly) ad iframe, and can cancel it.
function handleNavigate(event: Event) {
  if (!event.cancelable) return;
  const { userInitiated, destination } = event as NavigateEventLike;
  let url: URL;
  try {
    url = new URL(destination.url);
  } catch {
    return;
  }
  if (isTrustedDestination(url)) return;
  event.preventDefault();
  if (userInitiated || navigator.userActivation?.isActive) {
    window.open(url.href, '_blank', 'noopener,noreferrer');
  } else {
    console.warn('[Talishar] Ad guard blocked navigation to:', url.href);
  }
}

function getNavigation(): EventTarget | undefined {
  return (window as Window & { navigation?: EventTarget }).navigation;
}

function installNavGuard() {
  getNavigation()?.addEventListener('navigate', handleNavigate);
}

function removeNavGuard() {
  getNavigation()?.removeEventListener('navigate', handleNavigate);
}

function purgeAdElements() {
  document
    .querySelectorAll('script[src*="rev.iq"]')
    .forEach((el) => el.remove());
  document.querySelectorAll(AD_SELECTORS).forEach((el) => el.remove());
}

function purgeAdElement(node: Element): boolean {
  const isProviderScript =
    node instanceof HTMLScriptElement && node.src.includes('rev.iq');

  if (isProviderScript || node.matches?.(AD_SELECTORS)) {
    node.remove();
    return true;
  }

  return false;
}

function purgeAdElementOrDescendants(node: Element) {
  if (purgeAdElement(node)) return;

  node.querySelectorAll?.('script[src*="rev.iq"]').forEach((el) => el.remove());
  node.querySelectorAll?.(AD_SELECTORS)?.forEach((el) => el.remove());
}

export function wasAdProviderLoadedInDocument(): boolean {
  return Boolean(
    window.__talisharAdProviderLoaded ||
      document.querySelector('script[src*="rev.iq"]')
  );
}

const AD_IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';
const TOP_NAVIGATION_TOKEN_RE = /(^|\s)allow-top-navigation\S*/g;

// In-game, every iframe Talishar did not render itself belongs to the ad stack.
let containedMode = false;

function isAdIframe(iframe: HTMLIFrameElement, parent: Node | null): boolean {
  if (isReactPortalEl(iframe)) return false;
  if (containedMode) return true;
  const src = iframe.getAttribute('src') || '';
  if (
    src.includes('rev.iq') ||
    src.includes('revcontent') ||
    iframe.id.startsWith('rev-')
  ) {
    return true;
  }
  const container = parent instanceof Element ? parent : iframe.parentElement;
  return container?.closest('[data-ad], [id^="rev-"]') != null;
}

// Sandbox an ad iframe so it cannot navigate the top frame, even on click.
// allow-popups-to-escape-sandbox lets ad clicks open a new tab normally.
// A sandbox the provider already set only loses its top-navigation tokens.
function sandboxAdIframe(
  iframe: HTMLIFrameElement,
  parent: Node | null = iframe.parentNode
) {
  if (!isAdIframe(iframe, parent)) return;
  const sandbox = iframe.getAttribute('sandbox');
  if (sandbox === null) {
    iframe.setAttribute('sandbox', AD_IFRAME_SANDBOX);
  } else if (sandbox.includes('allow-top-navigation')) {
    iframe.setAttribute(
      'sandbox',
      sandbox.replace(TOP_NAVIGATION_TOKEN_RE, '').trim()
    );
  }
}

let insertionGuardInstalled = false;
let insertionGuardActive = false;

// GPT connects creative iframes with appendChild/insertBefore and they start
// loading at once. Sandbox flags are fixed when a frame navigates, so the
// sandbox has to be on the iframe before it is connected.
function installIframeInsertionGuard() {
  insertionGuardActive = true;
  if (insertionGuardInstalled) return;
  insertionGuardInstalled = true;

  const proto = Node.prototype;
  const originalAppendChild = proto.appendChild;
  const originalInsertBefore = proto.insertBefore;

  proto.appendChild = function appendChild<T extends Node>(
    this: Node,
    node: T
  ): T {
    if (insertionGuardActive && node?.nodeName === 'IFRAME') {
      sandboxAdIframe(node as unknown as HTMLIFrameElement, this);
    }
    return originalAppendChild.call(this, node) as T;
  };
  proto.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    child: Node | null
  ): T {
    if (insertionGuardActive && node?.nodeName === 'IFRAME') {
      sandboxAdIframe(node as unknown as HTMLIFrameElement, this);
    }
    return originalInsertBefore.call(this, node, child) as T;
  };
}

function sandboxAdIframesIn(root: Document | Element) {
  const container = root === document ? document.body : (root as Element);
  container
    ?.querySelectorAll?.('iframe')
    .forEach((el) => sandboxAdIframe(el as HTMLIFrameElement));
}

// React attaches __reactFiber$xxx to every DOM node it manages, including
// portal nodes that land outside #root. Skip those so we don't break game UI
// (e.g. PlayerHand portals to document.body).
function isReactPortalEl(el: Element): boolean {
  const keys = Object.keys(el);
  for (const key of keys) {
    if (key.startsWith('__reactFiber') || key.startsWith('__reactProps'))
      return true;
  }
  return false;
}

const CMP_IFRAME_HOSTS = [
  'fundingchoicesmessages.google.com',
  'consent.google.com',
  'privacymanager.io',
  'sp-prod.net',
  'cmp.quantcast.com',
  'cookie-cdn.cookiepro.com',
  'consentcdn.cookiebot.com'
];
const CMP_SELECTOR =
  '[id^="fc-"],[id^="sp_message_container"],[id^="qc-cmp"],' +
  '[id*="onetrust"],[id*="didomi"],[id*="CybotCookie"],[id^="truste"],[id*="usercentrics"]';

const VIDEO_AD_CONTAINER_SELECTOR =
  '[id^="reviq-"], [id^="prims_"], [id^="primis"], [class*="primis"]';
const VIDEO_AD_DISMISS_SELECTOR =
  '[aria-label*="close" i], [aria-label*="dismiss" i], ' +
  '[title*="close" i], [title*="dismiss" i], ' +
  '[id*="close" i], [id*="dismiss" i], ' +
  '[class*="close" i], [class*="dismiss" i], ' +
  '[data-action*="close" i], [data-action*="dismiss" i]';
const VIDEO_AD_INTERACTIVE_SELECTOR =
  'iframe, video, a, button, input, select, [role="button"], [tabindex], ' +
  VIDEO_AD_DISMISS_SELECTOR;
const VIDEO_AD_Z_INDEX = '9999';
// rev.iq's sticky anchor, appended straight to <body>.
const STICKY_AD_SELECTOR = '[data-reviq-sticky-ad]';

interface GptSlotLike {
  getSlotElementId(): string;
}

interface GoogleTagLike {
  pubads?: () => { getSlots?: () => GptSlotLike[] };
  destroySlots?: (slots: GptSlotLike[]) => boolean;
}

function isCMPElement(el: Element): boolean {
  try {
    if (el.matches(CMP_SELECTOR)) return true;
  } catch (_) {
    // Ignore selector errors from browser-specific injected markup.
  }
  for (const iframe of Array.from(el.querySelectorAll('iframe'))) {
    const src = (iframe as HTMLIFrameElement).src || '';
    if (CMP_IFRAME_HOSTS.some((host) => src.includes(host))) return true;
  }
  return false;
}

function isVideoAdElement(el: Element): boolean {
  try {
    return (
      el.matches(VIDEO_AD_CONTAINER_SELECTOR) ||
      el.querySelector(VIDEO_AD_CONTAINER_SELECTOR) !== null
    );
  } catch (_) {
    return false;
  }
}

function unlockElementTree(el: HTMLElement) {
  el.style.removeProperty('pointer-events');
  el.style.removeProperty('visibility');
  el.querySelectorAll<HTMLElement>('*').forEach((child) => {
    child.style.removeProperty('pointer-events');
  });
}

function raiseVideoAdElement(el: HTMLElement) {
  // Provider wrappers can cover most or all of the viewport on mobile even
  // when only a small floating player is visible. Keep those transparent
  // wrappers click-through and opt only the actual ad UI back into hit testing.
  el.style.removeProperty('visibility');
  el.style.setProperty('pointer-events', 'none', 'important');
  el.style.setProperty('z-index', VIDEO_AD_Z_INDEX, 'important');
  el.querySelectorAll<HTMLElement>('*').forEach((child) => {
    child.style.setProperty('pointer-events', 'none', 'important');
    if (child.matches(VIDEO_AD_CONTAINER_SELECTOR)) {
      child.style.setProperty('z-index', VIDEO_AD_Z_INDEX, 'important');
    }
  });
  el.querySelectorAll<HTMLElement>(VIDEO_AD_INTERACTIVE_SELECTOR).forEach(
    (child) => {
      child.style.setProperty('pointer-events', 'auto', 'important');
    }
  );
}

// The anchor is off everywhere. Hiding it is not enough: rev.iq still renders
// ads into a hidden anchor, so its slot is destroyed and the element removed.
function removeStickyAd(el: HTMLElement) {
  try {
    const googletag = (window as { googletag?: GoogleTagLike }).googletag;
    const slots = (googletag?.pubads?.().getSlots?.() ?? []).filter((slot) => {
      const slotEl = document.getElementById(slot.getSlotElementId());
      return slotEl !== null && el.contains(slotEl);
    });
    if (slots.length > 0) googletag?.destroySlots?.(slots);
  } catch (_) {
    // The provider may not have initialized Google Publisher Tags.
  }
  el.remove();
}

function lockNonRootBodyChildren() {
  if (!document.body) return;
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'root') continue;
    if (isReactPortalEl(el)) continue;
    const h = el as HTMLElement;
    if (isCMPElement(el)) {
      unlockElementTree(h);
      continue;
    }
    if (el.matches(STICKY_AD_SELECTOR)) {
      removeStickyAd(h);
      continue;
    }
    if (!containedMode && isVideoAdElement(el)) {
      raiseVideoAdElement(h);
      continue;
    }
    h.style.setProperty('pointer-events', 'none', 'important');
    // Hide all non-root body children so interstitial/vignette ads can't
    // visually cover the page regardless of what element type Google injects
    // (div, ins, iframe wrapper, etc.). pointer-events alone only stops clicks.
    h.style.setProperty('visibility', 'hidden', 'important');
    h.querySelectorAll<HTMLElement>('*').forEach((child) => {
      child.style.setProperty('pointer-events', 'none', 'important');
    });
  }
}

function unlockNonRootBodyChildren() {
  if (!document.body) return;
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'root' || el.matches(STICKY_AD_SELECTOR)) continue;
    unlockElementTree(el as HTMLElement);
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

export default function useAdScript(
  enabled = true,
  allowOnAdFreeRoute = false,
  contained = false
) {
  const isProtectedRoute = isAdFreeRoute(window.location.pathname);
  const shouldLoadProvider =
    enabled && ADS_ENABLED && (!isProtectedRoute || allowOnAdFreeRoute);

  useEffect(() => {
    if (!shouldLoadProvider) {
      removeNavGuard();
      purgeAdElements();

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            purgeAdElement(mutation.target as Element);
            continue;
          }

          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            purgeAdElementOrDescendants(node);
          }
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id', 'class', 'src', 'data-ad']
      });

      return () => {
        observer.disconnect();
      };
    }

    // Install the guards before injecting the ad script so any redirect
    // attempts from the ad network are blocked from the moment the script runs.
    containedMode = contained;
    installNavGuard();
    startAdAnalytics();
    installIframeInsertionGuard();

    if (!document.querySelector('script[src="//js.rev.iq/talishar.net"]')) {
      try {
        (window as any).googletag?.destroySlots?.();
      } catch (_) {
        // The provider may not have initialized Google Publisher Tags.
      }

      const script = document.createElement('script');
      script.src = '//js.rev.iq/talishar.net';
      script.async = true;
      window.__talisharAdProviderLoaded = true;
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
            // Only re-lock when something lands directly on body - React's
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
          if (!(node instanceof HTMLElement) || isReactPortalEl(node)) continue;
          if (node instanceof HTMLIFrameElement) {
            sandboxAdIframe(node);
          } else {
            sandboxAdIframesIn(node);
          }
        }
      }
    });
    iframeGuard.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => {
      window.clearInterval(overlayInterval);
      domGuard.disconnect();
      iframeGuard.disconnect();
      removeNavGuard();
      insertionGuardActive = false;
      containedMode = false;
    };
  }, [shouldLoadProvider, contained]);
}
