export interface BazaarDeck {
  name: string;
  deckId: string;
}

export interface BazaarDecksResponse {
  success: boolean;
  decks?: BazaarDeck[];
  error?: string;
}

export interface GetBazaarDecksRequest {
  metafyId: number | string;
  metafyHash: string;
}
