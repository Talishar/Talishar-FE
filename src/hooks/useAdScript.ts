import { useEffect } from 'react';
import { ADS_ENABLED, isAdFreeRoute } from 'config/ads';
import { startAdAnalytics } from 'utils/adAnalytics';
import { isFloatingVideoAdResource } from 'utils/videoAds';

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

function removeUnlessReactOwned(el: Element) {
  if (!isReactOwned(el)) el.remove();
}

function purgeAdElements() {
  document
    .querySelectorAll('script[src*="rev.iq"]')
    .forEach((el) => el.remove());
  document.querySelectorAll(AD_SELECTORS).forEach(removeUnlessReactOwned);
}

function purgeAdElement(node: Element): boolean {
  const isProviderScript =
    node instanceof HTMLScriptElement && node.src.includes('rev.iq');

  if (isProviderScript || node.matches?.(AD_SELECTORS)) {
    removeUnlessReactOwned(node);
    return true;
  }

  return false;
}

function purgeAdElementOrDescendants(node: Element) {
  if (purgeAdElement(node)) return;

  node.querySelectorAll?.('script[src*="rev.iq"]').forEach((el) => el.remove());
  node.querySelectorAll?.(AD_SELECTORS)?.forEach(removeUnlessReactOwned);
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

// Reject floating video tags before they load. GPT's creative iframes also
// need their sandbox set before appendChild or insertBefore connects them.
export function installAdInsertionGuard() {
  if (insertionGuardInstalled) return;
  insertionGuardInstalled = true;

  const proto = Node.prototype;
  const originalAppendChild = proto.appendChild;
  const originalInsertBefore = proto.insertBefore;

  proto.appendChild = function appendChild<T extends Node>(
    this: Node,
    node: T
  ): T {
    if (isFloatingVideoAdResource(node)) return node;
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
    if (isFloatingVideoAdResource(node)) return node;
    if (insertionGuardActive && node?.nodeName === 'IFRAME') {
      sandboxAdIframe(node as unknown as HTMLIFrameElement, this);
    }
    return originalInsertBefore.call(this, node, child) as T;
  };

  for (const method of ['append', 'prepend'] as const) {
    const insert = Element.prototype[method];
    Element.prototype[method] = function (this: Element, ...nodes) {
      insert.apply(this, nodes.filter((node) =>
        typeof node === 'string' || !isFloatingVideoAdResource(node)
      ));
    };
  }
}

function sandboxAdIframesIn(root: Document | Element) {
  const container = root === document ? document.body : (root as Element);
  container
    ?.querySelectorAll?.('iframe')
    .forEach((el) => sandboxAdIframe(el as HTMLIFrameElement));
}

// React attaches __reactFiber$xxx to every DOM node it manages, including
// portal nodes that land outside #root. Skip those so we don't break game UI
// (e.g. PlayerHand portals to document.body). Floating UI creates its portal
// root with document.createElement, so it carries no fiber key; match its
// marker attribute instead (keyword popovers render there).
function isReactOwned(el: Element): boolean {
  for (const key of Object.keys(el)) {
    if (key.startsWith('__reactFiber') || key.startsWith('__reactProps'))
      return true;
  }
  return false;
}

function isReactPortalEl(el: Element): boolean {
  return el.hasAttribute('data-floating-ui-portal') || isReactOwned(el);
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

// rev.iq's sticky anchor, appended straight to <body>.
const STICKY_AD_SELECTOR = '[data-reviq-sticky-ad]';
const REVIQ_CMP_HOST_SELECTOR = '[data-reviq-cmp="host"]';
const REVIQ_CMP_STYLE_ATTR = 'data-talishar-reviq-cmp';

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

function unlockElementTree(el: HTMLElement) {
  el.style.removeProperty('pointer-events');
  el.style.removeProperty('visibility');
  el.querySelectorAll<HTMLElement>('*').forEach((child) => {
    child.style.removeProperty('pointer-events');
  });
}

function addReviqCmpStyle(el: Element) {
  const root = el.shadowRoot;
  if (!root || root.querySelector(`style[${REVIQ_CMP_STYLE_ATTR}]`)) return;
  const style = document.createElement('style');
  style.setAttribute(REVIQ_CMP_STYLE_ATTR, '');
  style.textContent =
    '[hidden]{display:none!important}' +
    '[data-reviq-cmp="privacy-link"]{display:none!important}';
  root.appendChild(style);
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

let stickyAdGuardInstalled = false;

function removeStickyAdsIn(root: ParentNode) {
  root
    .querySelectorAll<HTMLElement>(STICKY_AD_SELECTOR)
    .forEach(removeStickyAd);
}

// Pages without useAdScript never run the overlay lock, but the provider stays
// loaded after an ad page and still appends its anchor there.
function installStickyAdGuard() {
  if (stickyAdGuardInstalled || !document.body) return;
  stickyAdGuardInstalled = true;
  removeStickyAdsIn(document.body);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement && node.matches(STICKY_AD_SELECTOR))
          removeStickyAd(node);
      }
    }
  }).observe(document.body, { childList: true });
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target;
      if (target instanceof HTMLElement && target.matches(STICKY_AD_SELECTOR))
        removeStickyAd(target);
    }
  }).observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-reviq-sticky-ad']
  });
}

const TEXT_FIELD_SELECTOR =
  'input, textarea, [contenteditable]:not([contenteditable="false"])';
const TYPING_GRACE_MS = 1000;

let blurredField: HTMLElement | null = null;
let lastKeyAt = 0;
let hoverQuery: MediaQueryList | undefined;

function onKeyDown() {
  lastKeyAt = Date.now();
}

function onFocusIn(event: FocusEvent) {
  if (!(event.target instanceof HTMLIFrameElement)) blurredField = null;
}

function onFocusOut(event: FocusEvent) {
  const field = event.target;
  blurredField =
    field instanceof HTMLElement && field.matches(TEXT_FIELD_SELECTOR)
      ? field
      : null;
}

// A creative that focuses itself while the pointer is elsewhere takes every
// key press, so text fields get their focus back and game hotkeys their page.
function restoreFocus(field: HTMLElement | null) {
  const active = document.activeElement;
  if (!(active instanceof HTMLIFrameElement) || isReactOwned(active)) return;
  hoverQuery ??= window.matchMedia('(hover: hover)');
  const stolen = hoverQuery.matches && !active.matches(':hover');
  if (field && field.isConnected && blurredField === field) {
    const typing = Date.now() - lastKeyAt < TYPING_GRACE_MS;
    if (typing || stolen) field.focus({ preventScroll: true });
    return;
  }
  if (!stolen || !active.closest('[data-ad]')) return;
  active.blur();
  window.focus();
}

function onWindowBlur() {
  const field = blurredField;
  window.setTimeout(() => window.setTimeout(() => restoreFocus(field), 0), 0);
}

function installFocusGuard() {
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
  window.addEventListener('blur', onWindowBlur);
}

function removeFocusGuard() {
  document.removeEventListener('keydown', onKeyDown, true);
  document.removeEventListener('focusin', onFocusIn, true);
  document.removeEventListener('focusout', onFocusOut, true);
  window.removeEventListener('blur', onWindowBlur);
  blurredField = null;
}

function lockNonRootBodyChildren() {
  if (!document.body) return;
  for (const el of Array.from(document.body.children)) {
    if (el.id === 'root') continue;
    if (isReactPortalEl(el)) continue;
    const h = el as HTMLElement;
    if (!containedMode && el.matches(REVIQ_CMP_HOST_SELECTOR)) {
      unlockElementTree(h);
      addReviqCmpStyle(el);
      continue;
    }
    if (isCMPElement(el)) {
      unlockElementTree(h);
      continue;
    }
    if (el.matches(STICKY_AD_SELECTOR)) {
      removeStickyAd(h);
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
      document
        .querySelectorAll(REVIQ_CMP_HOST_SELECTOR)
        .forEach(addReviqCmpStyle);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            purgeAdElement(mutation.target as Element);
            continue;
          }

          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.matches(REVIQ_CMP_HOST_SELECTOR)) {
              addReviqCmpStyle(node);
            }
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
    installAdInsertionGuard();
    insertionGuardActive = true;
    installFocusGuard();
    installStickyAdGuard();

    if (!document.querySelector('script[src="//js.rev.iq/talishar.net"]')) {
      try {
        const googletag = (window as { googletag?: GoogleTagLike }).googletag;
        const slots = googletag?.pubads?.().getSlots?.() ?? [];
        if (slots.length > 0) googletag?.destroySlots?.(slots);
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
      removeFocusGuard();
      insertionGuardActive = false;
      containedMode = false;
    };
  }, [shouldLoadProvider, contained]);
}
