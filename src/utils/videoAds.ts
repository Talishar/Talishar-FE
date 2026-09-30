import { isVideoAdRoute } from 'config/ads';

export const VIDEO_AD_CONTAINER_SELECTOR =
  '[id^="reviq-"], [data-reviq-sticky-ad], [id^="prims_"], ' +
  '[id^="primis"], [class*="primis"], [data-ad="video"]';

export function purgeVideoAdElements(root: Document | Element = document) {
  if (isVideoAdRoute(window.location.pathname)) return;
  if (root instanceof Element && root.matches(VIDEO_AD_CONTAINER_SELECTOR)) {
    root.remove();
    return;
  }
  root.querySelectorAll(VIDEO_AD_CONTAINER_SELECTOR).forEach((el) => el.remove());
}

// The provider can keep running after a React route change, even on pages that
// do not use the ad hook. Watch the document for video players on every route.
export function installVideoAdGuard() {
  purgeVideoAdElements();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        purgeVideoAdElements(mutation.target as Element);
      } else {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) purgeVideoAdElements(node);
        }
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id', 'class', 'data-ad', 'data-reviq-sticky-ad']
  });
  return () => observer.disconnect();
}
