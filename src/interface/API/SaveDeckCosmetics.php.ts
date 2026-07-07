export interface DeckAltArtSelection {
  cardId: string;
  altPath: string;
}

export interface SaveDeckCosmeticsRequest {
  decklink: string;
  cardBackId: string;
  playmatId: string;
  altArts: DeckAltArtSelection[];
}

export interface SaveDeckCosmeticsResponse {
  success: boolean;
  message: string;
  cardBackId?: string;
  playmatId?: string;
  altArts?: DeckAltArtSelection[];
}
