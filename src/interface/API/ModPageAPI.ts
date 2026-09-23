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

export interface PuzzleCard {
  id: string;
  name: string;
  type: string;
  cost: number;
  pitch: number;
  power: number;
  defense: number;
  goAgain: boolean;
}

export interface PuzzleRealTurn {
  threatened: number;
  dealt: number;
  cardsPlayed: number;
  pitched: number;
  resourcesUsed: number;
  blocked: number;
  cardsBlocked: number;
  overkill: number;
}

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleFlag {
  code: string;
  value: number;
}

export interface PuzzleCandidate {
  id: number;
  createdAt: string;
  format: string;
  turn: number;
  hero: string;
  heroName: string;
  opponentHero: string;
  opponentHeroName: string;
  status: number;
  life: number;
  opponentLife: number;
  hand: PuzzleCard[];
  arsenal: PuzzleCard[];
  weapons: PuzzleCard[];
  floating: number;
  actionPoints: number;
  handPitch: number;
  opponentEquipment: PuzzleCard[];
  opponentDefense: number;
  opponentHandCount: number;
  opponentArsenalCount: number;
  estimatedDamage: number;
  estimatedAttacks: number;
  realTurn: PuzzleRealTurn | null;
  score: number;
  difficulty: PuzzleDifficulty;
  flags: PuzzleFlag[];
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
  error?: string;
}
