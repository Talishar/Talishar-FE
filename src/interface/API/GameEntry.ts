// Shared shapes for the create/join/replay game entry endpoints.

export interface GameEntryFormik {
  deck?: string;
  fabdb?: string;
  deckTestMode?: boolean;
  format?: string;
  visibility?: string;
  decksToTry?: string;
  favoriteDeck?: boolean;
  favoriteDecks?: string;
  gameDescription?: string;
}

export interface GameEntryResponse {
  gameStarted?: boolean;
  error?: string;
  message?: string;
  gameName?: number;
  playerID?: number;
  authKey?: string;
}
