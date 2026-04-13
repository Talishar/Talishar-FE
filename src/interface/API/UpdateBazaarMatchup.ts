export interface UpdateBazaarMatchupRequest {
  deckId: string;
  heroId: string;
  metafyId: number | string | null;
  metafyHash: string | null;
  metafyTimestamp: number | null;
  sideboard: {
    in: string[];
    out: string[];
  };
}

export interface UpdateBazaarMatchupResponse {
  success: boolean;
  data?: {
    matchup: {
      heroId: string;
      sideboard: {
        in: string[];
        out: string[];
      };
      notes: string | null;
      preferredTurnOrder: string | null;
    };
  };
  error?: string;
}
