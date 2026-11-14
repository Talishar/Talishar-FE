export interface MatchHistoryGame {
  endedAt: number;
  won: boolean;
  format: string;
  turns: number;
  opponentName: string;
  heroCardId: string;
  heroName: string;
  opponentHeroCardId: string;
  opponentHeroName: string;
  savedReplayNumber: number | null;
  canSaveReplay: boolean;
}

export interface GetMatchHistoryResponse {
  loggedIn: boolean;
  limit?: number;
  games: MatchHistoryGame[];
}
