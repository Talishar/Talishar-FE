export const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true';

const AD_FREE_ROUTE_RE = /^\/(?:(?:game|roguelike)\/)?play(?:\/|$)/i;

export const isAdFreeRoute = (pathname: string) =>
  AD_FREE_ROUTE_RE.test(pathname);
