export interface SavedReplay {
  replayNumber: number;
  savedAt: number;
  p1DisplayName: string;
  p2DisplayName: string;
  p1HeroCardId: string;
  p2HeroCardId: string;
  p1HeroName: string;
  p2HeroName: string;
  favorite: boolean;
}

export interface SetReplayFavoriteRequest {
  replayNumber: number;
  favorite: boolean;
}

export interface ReplaySlotTier {
  tierName: string;
  slots: number;
}

export interface GetSavedReplaysResponse {
  loggedIn: boolean;
  replays: SavedReplay[];
  maxSlots: number;
  usedSlots: number;
  favoriteSlots: number;
  nextSlotTier: ReplaySlotTier | null;
  error?: string;
}
