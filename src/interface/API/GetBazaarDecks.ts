export interface BazaarDeck {
  id: string;
  name: string;
  hero?: string;
  format?: string | null;
  deckId?: string;
}

export interface BazaarDecksResponse {
  success: boolean;
  decks?: BazaarDeck[];
  error?: string;
}

export interface GetBazaarDecksRequest {
  metafyId: number | string;
  metafyHash: string;
  metafyTimestamp: number;
}
