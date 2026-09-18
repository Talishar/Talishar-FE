import { GameEntryResponse } from './GameEntry';

export interface LoadReplayAPI {
  replayNumber?: number; //number of the replay
}

export interface LoadReplayResponse extends GameEntryResponse {
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
