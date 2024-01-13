export interface CreateGameAPI {
  deck?: string; // This is for limited game modes (see JoinGameInput.php)
  fabdb?: string; // Deck builder decklink (any deckbuilder, name comes from when fabdb was the only one)
  deckTestMode?: boolean; // If this is populated with ANYTHING, will start a game against the combat dummy
  format?: string | number; // Format of the game enum (can also be a number)
  visibility?: string; // "public" = public game, "private" = private game
  decksToTry?: string; // This is only used if there's no favorite deck or decklink. 1 = ira
  favoriteDeck?: boolean; //Set this to true to save the provided deck link to your favorites
  favoriteDecks?: string; //This one is kind of weird. It's the favorite deck index, then the string "<fav>" then the favorite deck link
  gameDescription?: string; //Just a string with the game name
  user?: string; // User ID for external site like fabrary
  deckTestDeck?: string;//Deck of the deck test opponent (AI)
}

export interface CreateGameFormik {
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

export interface CreateGameResponse {
  gameStarted?: boolean;
  error?: string;
  message?: string;
  gameName?: number;
  playerID?: number;
  authKey?: string;
}

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
