import { FAB_BAZAAR_DECK_URL_BASE, FABRARY_DECK_URL_BASE } from 'appConstants';

const stripFavoriteDeckPrefix = (deckLink: string): string => {
  const favoriteMarker = deckLink.indexOf('<fav>');
  return favoriteMarker === -1
    ? deckLink
    : deckLink.slice(favoriteMarker + '<fav>'.length);
};

const extractDeckId = (deckLink: string, baseUrl: string): string | null => {
  const cleanedLink = stripFavoriteDeckPrefix(deckLink);
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (!cleanedLink.startsWith(normalizedBase)) return null;

  const deckId = cleanedLink.slice(normalizedBase.length).split('?')[0].trim();
  return deckId || null;
};

export const extractBazaarDeckIdFromLink = (deckLink?: string): string | null =>
  deckLink ? extractDeckId(deckLink, FAB_BAZAAR_DECK_URL_BASE) : null;

export const supportsAutomaticMatchups = (deckLink?: string): boolean => {
  if (!deckLink) return false;
  return (
    extractDeckId(deckLink, FAB_BAZAAR_DECK_URL_BASE) !== null ||
    extractDeckId(deckLink, FABRARY_DECK_URL_BASE) !== null
  );
};
