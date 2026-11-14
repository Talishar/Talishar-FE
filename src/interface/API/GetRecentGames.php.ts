export interface RecentGame {
  token: string;
  endedAt: number;
  expiresAt: number;
  playerID: 1 | 2;
  format: string;
  p1DisplayName: string;
  p2DisplayName: string;
  p1HeroCardId: string;
  p2HeroCardId: string;
  p1HeroName: string;
  p2HeroName: string;
  savedReplayNumber: number | null;
}

export interface GetRecentGamesResponse {
  loggedIn: boolean;
  games: RecentGame[];
  ttlSeconds: number;
  slotsFull: boolean;
  maxSlots: number;
  usedSlots: number;
  capacity: number;
}

export interface SaveRecentGameRequest {
  token: string;
}

export interface SaveRecentGameResponse {
  success: boolean;
  replayNumber?: number;
  message?: string;
  error?: string;
}
