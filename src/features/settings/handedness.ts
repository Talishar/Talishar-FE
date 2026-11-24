import { useCookieString } from 'utils/cookieStore';

export const LEFT_HANDED_COOKIE = 'leftHanded';

export const useLeftHanded = () =>
  useCookieString(LEFT_HANDED_COOKIE) === 'true';
