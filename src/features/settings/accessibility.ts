import { useAppSelector } from 'app/Hooks';
import { COLORBLIND_MODE } from 'features/options/constants';
import { readCookie, useCookieString, useCookieValue } from 'utils/cookieStore';
import { parseColorblindPreset } from './colorblindPresets';

export const REDUCED_MOTION_COOKIE = 'reducedMotion';
export const PROMPT_TEXT_SIZE_COOKIE = 'promptTextSize';
export const CHAT_TEXT_SIZE_COOKIE = 'chatTextSize';

export const TEXT_SCALE_VARS = [
  [PROMPT_TEXT_SIZE_COOKIE, '--text-scale-prompt'],
  [CHAT_TEXT_SIZE_COOKIE, '--text-scale-chat']
] as const;

export const TEXT_SCALE_MIN = 0.8;
export const TEXT_SCALE_MAX = 2;

export const parseTextScale = (raw: unknown) => {
  const value = Number(raw);
  if (
    raw === undefined ||
    raw === null ||
    raw === '' ||
    !Number.isFinite(value)
  )
    return 1;
  return Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, value));
};

export const useTextScale = (cookie: string) =>
  parseTextScale(useCookieValue(cookie));

export const useReducedMotionSetting = () =>
  useCookieString(REDUCED_MOTION_COOKIE) === 'true';

/** For code outside React render, such as module level animation checks. */
export const isReducedMotion = () =>
  readCookie(REDUCED_MOTION_COOKIE) === 'true' ||
  (typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export const useColorblindPreset = () =>
  parseColorblindPreset(
    useAppSelector((state) => state.settings.entities[COLORBLIND_MODE]?.value)
  );
