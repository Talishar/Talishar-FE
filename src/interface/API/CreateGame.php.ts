export interface CreateGameAPI {
  deck?: string;
  fabdb?: string; // link to fabdb or fabrary
  deckTestMode?: boolean; // true for against practice dummy
  format?: string; // have enum
  visibility?: string; // "public" for public or "private" for private
  decksToTry?: string; // deprecated
  favoriteDeck?: number; // 0 for off 1 for on
  favoriteDecks?: string; // URL to fabrary
  gameDescription?: string;
}

export interface CreateGameFormik {
  deck?: string;
  fabdb?: string; // link to fabdb or fabrary
  deckTestMode?: boolean; // true for against practice dummy
  format?: string; // have enum
  visibility?: string; // "public" for public or "private" for private
  decksToTry?: string; // deprecated
  favoriteDeck?: boolean; // 0 for off 1 for on
  favoriteDecks?: string; // URL to fabrary
  gameDescription?: string;
}

export const convertFormikToAPI = (input: CreateGameFormik) => {
  return { ...input, favoriteDeck: input.favoriteDeck ? '1' : '0' };
};

/*
{
  "deck": "",
  "fabdb": "https://fabdb.net/decks/build/JjNXyjWW",
  "deckTestMode": true,
  "format": "blitz",
  "visibility": "private",
  "decksToTry": "",
  "favoriteDeck": true,
  "favoriteDecks": "",
  "gameDescription": ""
}
*/
