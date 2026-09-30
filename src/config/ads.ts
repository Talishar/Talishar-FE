export const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true';

const AD_FREE_ROUTE_RE = /^\/(?:game\/)?play(?:\/|$)/i;

export const isAdFreeRoute = (pathname: string) =>
  AD_FREE_ROUTE_RE.test(pathname);

const VIDEO_AD_ROUTE_RE =
  /^\/(?:learn|about|mastery|game\/load|ads-test)?\/?$/i;

export const isVideoAdRoute = (pathname: string) =>
  VIDEO_AD_ROUTE_RE.test(pathname);
