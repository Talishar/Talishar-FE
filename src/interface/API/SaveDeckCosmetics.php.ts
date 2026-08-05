export interface DeckAltArtSelection {
  cardId: string;
  altPath: string;
}

export interface SaveDeckCosmeticsRequest {
  decklink: string;
  cardBackId: string;
  playmatId: string;
  /** Omit when changing only the playmat/card back so saved alt arts remain intact. */
  altArts?: DeckAltArtSelection[];
}

export interface SaveDeckCosmeticsResponse {
  success: boolean;
  message: string;
  cardBackId?: string;
  playmatId?: string;
  altArts?: DeckAltArtSelection[];
}
