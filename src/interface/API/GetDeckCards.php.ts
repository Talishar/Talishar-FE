export interface GetDeckCardsRequest {
  decklink: string;
}

export interface DeckCardAltArtOptions {
  cardId: string;
  altArts: string[];
  baseCardNumber: string;
  selectedAltPath: string | null;
}

export interface GetDeckCardsResponse {
  cards: DeckCardAltArtOptions[];
  message?: string;
}
