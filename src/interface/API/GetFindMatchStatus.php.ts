// Why the player can't be matched into (or join) one open lobby.
// own: their own lobby. kicked: the host kicked them. heroIllegal: their deck's
// hero isn't legal in the lobby's format. theyRejectHero: the lobby's hero
// preference excludes their hero. youRejectHero: their own hero filter excludes
// the lobby's hero. learning: a learning lobby, never auto-matched.
export type FindMatchBlocker =
  | 'own'
  | 'kicked'
  | 'heroIllegal'
  | 'theyRejectHero'
  | 'youRejectHero'
  | 'learning';

export interface FindMatchStatusRequest {
  hero: string;
  preference: string;
  format: string;
}

export interface FindMatchSummary {
  format: string;
  competitive: boolean;
  heroLegal: boolean | null;
  waiting: number;
  matches: number[];
  reasons: Partial<Record<FindMatchBlocker, number>>;
  otherFormats: Record<string, number>;
}

// One Find match step from FindMatch.php. join: try these lobbies in order (the
// first is reserved for you). wait: a fitting player is creating a lobby, ask
// again after retryMs. host: create a public lobby with this ticket.
export type FindMatchResponse =
  | { action: 'join'; games: number[]; error?: undefined }
  | { action: 'wait'; retryMs: number; error?: undefined }
  | { action: 'host'; ticket: string; error?: undefined }
  | { action: 'cancelled'; error?: undefined }
  | { action?: undefined; error: string };

export type FindMatchRequest =
  | (FindMatchStatusRequest & { exclude?: number[] })
  | { cancel: string };

export interface FindMatchStatusResponse {
  heroKnown?: boolean;
  hero?: string;
  heroName?: string;
  heroShortName?: string;
  hasPreference?: boolean;
  blockers: Record<string, FindMatchBlocker[]>;
  summary?: FindMatchSummary;
  error?: string;
}
