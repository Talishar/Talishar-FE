const VIDEO_AD_RESOURCE_SELECTOR = [
  'script[src*="av_tagid=" i]',
  ':is(script, iframe)[src*="vidcrunch.com" i]',
  ':is(script, iframe)[src*="aniview.com" i]',
  ':is(script, iframe)[src*="primis.tech" i]'
].join(', ');

const VIDEO_AD_SELECTOR = [
  VIDEO_AD_RESOURCE_SELECTOR,
  '#talishar-video-ad',
  '[data-ad="video"]',
  '[id^="reviq-" i][id*="player" i]',
  '[id^="prims_" i]',
  '[class*="primis" i], [id^="primis" i]'
].join(', ');

export function isFloatingVideoAdResource(node: Node): boolean {
  return (
    (node?.nodeName === 'SCRIPT' || node?.nodeName === 'IFRAME') &&
    (node as Element).matches(VIDEO_AD_RESOURCE_SELECTOR)
  );
}

// The ad provider can outlive the route that loaded it. Clean up existing and
// late player markup for the whole document, including outside the React root.
export function installFloatingVideoAdGuard() {
  const removeAds = (root: ParentNode) =>
    root
      .querySelectorAll(VIDEO_AD_SELECTOR)
      .forEach((element) => element.remove());

  removeAds(document);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        const element = mutation.target as Element;
        if (element.matches(VIDEO_AD_SELECTOR)) element.remove();
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(VIDEO_AD_SELECTOR)) node.remove();
        else removeAds(node);
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id', 'class', 'src', 'data-ad']
  });
  return () => observer.disconnect();
}
