import { TALISHAR_METAFY_URL } from 'constants/socialLinks';

export type MemberLinkSource =
  | 'adblock-notice'
  | 'badge'
  | 'decks-alt-arts'
  | 'decks-banner'
  | 'end-game'
  | 'footer'
  | 'home-about'
  | 'home-hero'
  | 'house-ad-banner'
  | 'house-ad-tier'
  | 'in-game-card'
  | 'lobby-card'
  | 'premium-cta'
  | 'premium-tier'
  | 'profile-upgrade'
  | 'remove-ads-end-game'
  | 'remove-ads-in-game'
  | 'remove-ads-lobby'
  | 'rust-panel'
  | 'stats-csv'
  | 'stats-watermark'
  | 'theme-lock';

export const MEMBER_LINK_PLACEMENT_PREFIX = 'cta-';

const UTM_SOURCE = 'talishar';
const SOURCE_PARAM = 'utm_content';
const SOURCE_RE = /^[a-z][a-z-]{0,35}$/;

export function memberLink(source: MemberLinkSource): string {
  const url = new URL(TALISHAR_METAFY_URL);
  url.searchParams.set('utm_source', UTM_SOURCE);
  url.searchParams.set('utm_medium', 'site');
  url.searchParams.set(SOURCE_PARAM, source);
  return url.toString();
}

export function memberLinkSource(href: string): string | null {
  try {
    const url = new URL(href, window.location.href);
    if (!/(^|\.)metafy\.gg$/i.test(url.hostname)) return null;
    if (url.searchParams.get('utm_source') !== UTM_SOURCE) return null;
    const source = url.searchParams.get(SOURCE_PARAM) ?? '';
    return SOURCE_RE.test(source) ? source : null;
  } catch {
    return null;
  }
}
