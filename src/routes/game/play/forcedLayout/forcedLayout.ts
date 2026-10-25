import GameStaticInfo from 'features/GameStaticInfo';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieString } from 'utils/cookieStore';

export type ForcedLayout = 'none' | 'phone' | 'tablet';
export type FramedLayout = Exclude<ForcedLayout, 'none'>;

export const FORCED_LAYOUT_COOKIE = 'forcedMobileLayout';
export const FORCED_LAYOUT_FRAME_NAME = 'talisharForcedLayout';
export const FORCED_FRAME_MESSAGE = 'talishar:forcedLayoutFrame';
const FORCED_FRAME_BOOT_KEY = 'forcedLayoutFrameGameInfo';

export const PHONE_LANDSCAPE_BOARD_QUERY =
  '(orientation: landscape) and (max-width: 1199px) and (max-height: 500px)';
export const TABLET_LANDSCAPE_BOARD_QUERY =
  '(orientation: landscape) and (max-width: 1199px) and (min-height: 501px)';

const PHONE_FRAME_HEIGHT = 413;
const PHONE_FRAME_MIN_ASPECT = 16 / 9;
const FRAME_MAX_WIDTH = 1198;
const TABLET_FRAME_MIN_HEIGHT = 502;

export const readForcedLayout = (raw: unknown): ForcedLayout =>
  raw === 'phone' || raw === 'tablet' ? raw : 'none';

export const useForcedLayout = () =>
  readForcedLayout(useCookieString(FORCED_LAYOUT_COOKIE));

export const isForcedLayoutFrame = () =>
  typeof window !== 'undefined' &&
  window.parent !== window &&
  window.name === FORCED_LAYOUT_FRAME_NAME;

export const useForcedBoard = () => {
  const forced = useForcedLayout();
  const phoneBoard = useMediaQuery(PHONE_LANDSCAPE_BOARD_QUERY);
  const tabletBoard = useMediaQuery(TABLET_LANDSCAPE_BOARD_QUERY);
  return (
    (forced === 'phone' && phoneBoard) || (forced === 'tablet' && tabletBoard)
  );
};

export const useForcedLayoutFrame = (): FramedLayout | null => {
  const forced = useForcedLayout();
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const forcedBoard = useForcedBoard();
  if (forced === 'none' || isPortrait || forcedBoard || isForcedLayoutFrame())
    return null;
  return forced;
};

export const forcedFrameSize = (
  layout: FramedLayout,
  width: number,
  height: number
) => {
  const aspect = width / height;
  if (layout === 'phone') {
    const frameWidth = Math.round(
      PHONE_FRAME_HEIGHT *
        Math.min(
          Math.max(aspect, PHONE_FRAME_MIN_ASPECT),
          FRAME_MAX_WIDTH / PHONE_FRAME_HEIGHT
        )
    );
    return {
      width: frameWidth,
      height: PHONE_FRAME_HEIGHT,
      scale: Math.min(width / frameWidth, height / PHONE_FRAME_HEIGHT)
    };
  }
  const frameHeight = Math.min(
    Math.round(
      FRAME_MAX_WIDTH /
        Math.min(aspect, FRAME_MAX_WIDTH / TABLET_FRAME_MIN_HEIGHT)
    ),
    FRAME_MAX_WIDTH - 1
  );
  return {
    width: FRAME_MAX_WIDTH,
    height: frameHeight,
    scale: Math.min(width / FRAME_MAX_WIDTH, height / frameHeight)
  };
};

const patchTouchMediaRules = (rules: CSSRuleList) => {
  Array.from(rules).forEach((rule) => {
    if (rule instanceof CSSMediaRule) {
      const { media } = rule;
      const next = media.mediaText
        .replace(/\(pointer:\s*coarse\)/g, '(pointer)')
        .replace(/\(hover:\s*none\)/g, '(hover)');
      if (next !== media.mediaText) media.mediaText = next;
    }
    if ('cssRules' in rule)
      patchTouchMediaRules((rule as CSSGroupingRule).cssRules);
  });
};

const patchTouchMediaSheet = (sheet: CSSStyleSheet | null) => {
  if (!sheet) return;
  try {
    patchTouchMediaRules(sheet.cssRules);
  } catch {
    return;
  }
};

const watchStylesheetLink = (link: HTMLLinkElement) => {
  patchTouchMediaSheet(link.sheet);
  link.addEventListener('load', () => patchTouchMediaSheet(link.sheet));
};

const patchTouchMediaNode = (node: Node) => {
  if (node instanceof HTMLStyleElement) patchTouchMediaSheet(node.sheet);
  else if (node instanceof HTMLLinkElement && node.rel === 'stylesheet')
    watchStylesheetLink(node);
};

export const installForcedFrameTouchMedia = () => {
  Array.from(document.styleSheets).forEach(patchTouchMediaSheet);
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    .forEach(watchStylesheetLink);
  new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach(patchTouchMediaNode);
      const target =
        record.target instanceof Element
          ? record.target
          : record.target.parentElement;
      if (target instanceof HTMLStyleElement)
        patchTouchMediaSheet(target.sheet);
    });
  }).observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true
  });
};

let frameZoomProbe: Promise<boolean> | null = null;

export const frameZoomWorks = (): Promise<boolean> => {
  if (frameZoomProbe) return frameZoomProbe;
  frameZoomProbe = new Promise<boolean>((resolve) => {
    const probe = document.createElement('iframe');
    probe.setAttribute('aria-hidden', 'true');
    probe.tabIndex = -1;
    probe.style.cssText =
      'position:fixed;left:0;top:0;width:100px;height:50px;zoom:2;border:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const works = probe.contentWindow?.innerWidth === 100;
      probe.remove();
      resolve(works);
    };
    requestAnimationFrame(() => requestAnimationFrame(finish));
    setTimeout(finish, 150);
  });
  return frameZoomProbe;
};

type ForcedFrameBoot = { gameInfo: GameStaticInfo | null; state: unknown };

export const writeForcedFrameBoot = (boot: ForcedFrameBoot): void => {
  try {
    sessionStorage.setItem(FORCED_FRAME_BOOT_KEY, JSON.stringify(boot));
  } catch {
    return;
  }
};

let forcedFrameBoot: ForcedFrameBoot | null = null;

export const takeForcedFrameBoot = (): ForcedFrameBoot => {
  if (forcedFrameBoot) return forcedFrameBoot;
  let boot: ForcedFrameBoot = { gameInfo: null, state: null };
  try {
    const raw = sessionStorage.getItem(FORCED_FRAME_BOOT_KEY);
    sessionStorage.removeItem(FORCED_FRAME_BOOT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      boot = {
        gameInfo: parsed?.gameInfo ?? null,
        state: parsed?.state ?? null
      };
    }
  } catch {
    boot = { gameInfo: null, state: null };
  }
  forcedFrameBoot = boot;
  return boot;
};

export type ForcedFrameMessage =
  | {
      type: typeof FORCED_FRAME_MESSAGE;
      kind: 'layout';
      gameInfo: GameStaticInfo;
    }
  | {
      type: typeof FORCED_FRAME_MESSAGE;
      kind: 'navigate';
      to: string;
      state: unknown;
      gameInfo: GameStaticInfo;
    };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export const isForcedFrameMessage = (
  data: unknown
): data is ForcedFrameMessage => {
  if (typeof data !== 'object' || data === null) return false;
  const message = data as Record<string, unknown>;
  if (message.type !== FORCED_FRAME_MESSAGE) return false;
  if (typeof message.gameInfo !== 'object' || message.gameInfo === null)
    return false;
  if (message.kind === 'layout') return true;
  return message.kind === 'navigate' && typeof message.to === 'string';
};

export const postForcedFrameMessage = (
  message: DistributiveOmit<ForcedFrameMessage, 'type'>
) => {
  window.parent.postMessage(
    { type: FORCED_FRAME_MESSAGE, ...message },
    window.location.origin
  );
};
