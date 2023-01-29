export interface CreateGame {
  deck?: string;
  decklink?: string;
  deckTestMode?: boolean; // true for against practice dummy
  format?: string; // have enum
  visibility?: string; // "public" for public or "private" for private
  decksToTry?: string; // deprecated
  favoriteDeck?: number; // 0 for off 1 for on
  favoriteDecks?: string; // URL to fabrary
  gameDescription?: string;
}
