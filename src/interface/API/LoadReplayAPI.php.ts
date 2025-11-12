export interface LoadReplayAPI {
  replayNumber?: number; //number of the replay
}

// export interface CreateGameFormik {
//   deck?: string;
//   fabdb?: string;
//   deckTestMode?: boolean;
//   format?: string;
//   visibility?: string;
//   decksToTry?: string;
//   favoriteDeck?: boolean;
//   favoriteDecks?: string;
//   gameDescription?: string;
// }

export interface LoadReplayResponse {
  gameStarted?: boolean;
  error?: string;
  message?: string;
  gameName?: number;
  playerID?: number;
  authKey?: string;
  success?: boolean;
  missingFiles?: Record<string, string>;
  copyErrors?: string[];
  debug?: {
    [key: string]: any;
  };
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
