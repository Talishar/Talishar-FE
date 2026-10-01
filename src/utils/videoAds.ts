import { trackVideoAdPlayer } from 'utils/adAnalytics';

export const VIDEO_AD_SLOT_ID = 'talishar-video-ad';
export const VIDEO_AD_STARTED_EVENT = 'talishar:video-ad-started';

const VIDEO_TAG_SELECTOR = 'script[src*="AV_TAGID="]';
const PLAYER_API_NAME = 'talisharVideoAdPlayer';

// The provider's video tag (VidCrunch) appends its player after the footer
// unless told otherwise. It reads data-* attributes on its own script element
// as config overrides, so point it at the dock, keep it waiting until a dock
// exists, and have it destroy the player (and drop its DOM observer) once the
// dock unmounts.
const VIDEO_TAG_OVERRIDES: Record<string, string> = {
  'data-pos-selector': `#${VIDEO_AD_SLOT_ID}`,
  'data-pos-timeout': '1000000',
  'data-destroy-on-host-removal': 'true',
  'data-player-api': PLAYER_API_NAME
};

interface VideoAdPlayer {
  on?: (event: string, callback: () => void) => void;
}

let videoTag: HTMLScriptElement | null = null;
let videoTagCreatedPlayer = false;

// Ads can render inside a cross-origin iframe whose media events never reach
// the page, so also forward the player's own ad start events to the dock.
function onVideoAdPlayerCreated(_config: unknown, player: VideoAdPlayer) {
  videoTagCreatedPlayer = true;
  const notifyStarted = () => {
    document
      .getElementById(VIDEO_AD_SLOT_ID)
      ?.dispatchEvent(new Event(VIDEO_AD_STARTED_EVENT));
  };
  player?.on?.('AdStarted', notifyStarted);
  player?.on?.('AdImpression', notifyStarted);
  trackVideoAdPlayer(player);
}

function configureVideoTag(node: Node) {
  if (!(node instanceof HTMLScriptElement) || !node.matches(VIDEO_TAG_SELECTOR))
    return;
  for (const [name, value] of Object.entries(VIDEO_TAG_OVERRIDES)) {
    node.setAttribute(name, value);
  }
  if (node !== videoTag) {
    videoTag = node;
    videoTagCreatedPlayer = false;
  }
}

let videoTagConfigInstalled = false;

// The tag is injected by the provider some time after its main script loads,
// possibly while a page without the ad hook is mounted, so watch for it for the
// whole session. Async scripts run in a later task than their insertion, so the
// attributes are always in place before the tag reads them.
export function installVideoAdTagConfig() {
  if (videoTagConfigInstalled) return;
  videoTagConfigInstalled = true;

  (window as any)[PLAYER_API_NAME] = onVideoAdPlayerCreated;
  document.querySelectorAll(VIDEO_TAG_SELECTOR).forEach(configureVideoTag);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(configureVideoTag);
    }
  });
  observer.observe(document.head, { childList: true });
  observer.observe(document.body, { childList: true });
}

// A tag instance builds one player. Once that player went away with an earlier
// dock, run the tag again so the new dock gets its own.
export function restartVideoAdTagIfUsed() {
  if (!videoTag || !videoTagCreatedPlayer) return;
  const freshTag = document.createElement('script');
  for (const { name, value } of Array.from(videoTag.attributes)) {
    freshTag.setAttribute(name, value);
  }
  videoTag.remove();
  document.head.appendChild(freshTag);
  configureVideoTag(freshTag);
}
