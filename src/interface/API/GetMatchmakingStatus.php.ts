// Why the player can't be matched into (or join) one open lobby.
// own: their own lobby. kicked: the host kicked them. heroIllegal: their deck's
// hero isn't legal in the lobby's format. theyRejectHero: the lobby's hero
// preference excludes their hero. youRejectHero: their own hero filter excludes
// the lobby's hero. learning: a learning lobby, never auto-matched.
export type MatchmakingBlocker =
  | 'own'
  | 'kicked'
  | 'heroIllegal'
  | 'theyRejectHero'
  | 'youRejectHero'
  | 'learning';

export interface MatchmakingStatusRequest {
  hero: string;
  preference: string;
  format: string;
}

export interface MatchmakingSummary {
  format: string;
  competitive: boolean;
  heroLegal: boolean | null;
  waiting: number;
  matches: number[];
  reasons: Partial<Record<MatchmakingBlocker, number>>;
  otherFormats: Record<string, number>;
}

export interface MatchmakingStatusResponse {
  heroKnown?: boolean;
  hero?: string;
  heroName?: string;
  heroShortName?: string;
  hasPreference?: boolean;
  blockers: Record<string, MatchmakingBlocker[]>;
  summary?: MatchmakingSummary;
  error?: string;
}
