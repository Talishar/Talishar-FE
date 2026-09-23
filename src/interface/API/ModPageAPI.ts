// Mod Page API interfaces

export interface BanPlayerByIPRequest {
  ipToBan: string;
  playerNumberToBan: string;
}

export interface BanIPDirectRequest {
  directIPToBan: string;
}

export interface BanPlayerByNameRequest {
  playerToBan: string;
}

export interface DeleteUsernameRequest {
  usernameToDelete: string;
}

export interface CloseGameRequest {
  gameToClose: string;
}

export interface ResetAllRustCountersResponse {
  success: boolean;
  usersReset: number;
  message?: string;
}

export interface BannedPlayersResponse {
  bannedPlayers: string[];
}

export interface BannedIPsResponse {
  bannedIPs: string[];
}

export interface RecentAccountsResponse {
  recentAccounts: string[];
}

export interface LinkedAccount {
  username: string;
  ip: string;
  linkedTo: string;
}

export interface TopSpectator {
  username: string;
  gameCount: number;
}

export interface ModPageDataResponse {
  topSpectators?: TopSpectator[] | null;
  bannedPlayers: string[];
  bannedIPs: string[];
  recentAccounts: string[];
  linkedAccounts?: LinkedAccount[];
  bannedPlayerIPs?: Record<string, string[]>;
}

export interface SearchUsernamesRequest {
  searchQuery: string;
}

export interface UserSearchResult {
  username: string;
  email: string;
}

export interface SearchUsernamesResponse {
  users: UserSearchResult[];
}

export type PromptStatsRange = 1 | 7 | 30 | 90;

export interface PromptAnswerCount {
  answer: string;
  count: number;
}

export interface PromptStat {
  phase: string;
  context: string;
  contextName: string;
  isCard?: boolean;
  count: number;
  forced: number;
  identical: number;
  avgMs: number;
  answers: PromptAnswerCount[];
}

export interface PromptStatsResponse {
  days: PromptStatsRange;
  since: string;
  totalAnswers: number;
  prompts: PromptStat[];
  error?: string;
}

export interface PuzzleCandidate {
  id: number;
  createdAt: string;
  format: string;
  turn: number;
  player: number;
  hero: string;
  heroName: string;
  opponentHero: string;
  opponentHeroName: string;
  opponentLife: number;
  handCount: number;
  opponentHandCount: number;
  status: number;
}

export interface PuzzleCandidatesResponse {
  total: number;
  candidates: PuzzleCandidate[];
  error?: string;
}

export interface CreatePuzzleGameRequest {
  candidateId: number;
  emptyOpponentHand: boolean;
  removeDecks: boolean;
}

export interface CreatePuzzleGameResponse {
  gameName: number;
  playerID: number;
  authKey: string;
  opponentPlayerID: number;
  opponentAuthKey: string;
  error?: string;
}
