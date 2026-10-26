import GameStaticInfo from 'features/GameStaticInfo';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieValue } from 'utils/cookieStore';

export const FORCED_LAYOUT_COOKIE = 'forcedMobileLayout';
export const FORCED_LAYOUT = { NONE: 0, PHONE: 1, TABLET: 2 } as const;
export const FORCED_LAYOUT_FRAME_NAME = 'talisharForcedLayout';

const PHONE_BOARD_QUERY =
  '(orientation: landscape) and (max-height: 500px) and (pointer: coarse)';
const TABLET_BOARD_QUERY =
  '(orientation: landscape) and (max-width: 1199px) and (min-height: 501px)';

export interface ForcedLayoutHost {
  gameInfo: GameStaticInfo;
  state: unknown;
  sync: (
    gameInfo: GameStaticInfo,
    to?: { path: string; state: unknown }
  ) => void;
}

declare global {
  interface Window {
    forcedLayoutHost?: ForcedLayoutHost;
  }
}

export const frameHost =
  typeof window !== 'undefined' &&
  window.name === FORCED_LAYOUT_FRAME_NAME &&
  window.parent !== window
    ? window.parent.forcedLayoutHost
    : undefined;

export const useForcedLayout = (): number => {
  const value = Number(useCookieValue(FORCED_LAYOUT_COOKIE));
  return value === FORCED_LAYOUT.PHONE || value === FORCED_LAYOUT.TABLET
    ? value
    : FORCED_LAYOUT.NONE;
};

export const useForcedLayoutFrame = (): number => {
  const layout = useForcedLayout();
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const alreadyShown = useMediaQuery(
    layout === FORCED_LAYOUT.PHONE ? PHONE_BOARD_QUERY : TABLET_BOARD_QUERY
  );
  return frameHost || !isLandscape || alreadyShown
    ? FORCED_LAYOUT.NONE
    : layout;
};

export const forcedFrameSize = (
  layout: number,
  width: number,
  height: number
) => {
  const aspect = width / height;
  const frame =
    layout === FORCED_LAYOUT.PHONE
      ? {
          width: Math.min(1198, Math.round(413 * Math.max(aspect, 16 / 9))),
          height: 413
        }
      : {
          width: 1198,
          height: Math.min(1197, Math.max(502, Math.round(1198 / aspect)))
        };
  return {
    ...frame,
    scale: Math.min(width / frame.width, height / frame.height)
  };
};

const patchTouchRules = (rules: CSSRuleList) => {
  Array.from(rules).forEach((rule) => {
    if (rule instanceof CSSMediaRule) {
      const { media } = rule;
      const patched = media.mediaText.replace(
        /\(pointer: coarse\)/g,
        '(pointer)'
      );
      if (patched !== media.mediaText) media.mediaText = patched;
    }
    if ('cssRules' in rule) patchTouchRules((rule as CSSGroupingRule).cssRules);
  });
};

const patchTouchStyleSheets = () => {
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      patchTouchRules(sheet.cssRules);
    } catch {
      return;
    }
  });
};

export const installForcedLayoutFrame = () => {
  document.addEventListener(
    'load',
    (event) => {
      if (event.target instanceof HTMLLinkElement) patchTouchStyleSheets();
    },
    true
  );
  new MutationObserver(patchTouchStyleSheets).observe(document.head, {
    childList: true
  });
  patchTouchStyleSheets();

  const favicon = document.getElementById('favicon');
  const parentFavicon = window.parent.document.getElementById('favicon');
  if (!favicon || !parentFavicon) return;
  new MutationObserver(() =>
    parentFavicon.setAttribute('href', favicon.getAttribute('href') ?? '')
  ).observe(favicon, { attributeFilter: ['href'] });
};
