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
  isCard: boolean;
  count: number;
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

export interface ClearPromptStatsResponse {
  success: boolean;
  answersCleared: number;
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

export type PuzzleKind = 'lethal' | 'survive';

export type PuzzleMode = 'lethal' | 'damage' | 'survive';

export interface PuzzleProof extends Partial<PuzzleRealTurn> {
  status: 'proven' | 'failed';
  life?: number;
  realLife?: number;
  reason?: string;
}

export interface PuzzleFlag {
  code: string;
  value: number;
}

export interface PuzzleStepCard {
  id: string;
  name: string;
}

export interface PuzzleStep {
  kind:
    | 'PLAY'
    | 'PITCH'
    | 'ACTIVATE'
    | 'BLOCK'
    | 'CHOOSE'
    | 'DECLINE'
    | 'OPT'
    | 'ORDER';
  cards?: PuzzleStepCard[];
  top?: PuzzleStepCard[];
  bottom?: PuzzleStepCard[];
  from?: string;
  text?: string;
  prompt?: string;
  target?: PuzzleStepCard;
}

export interface PuzzleBot {
  won: boolean;
  damage: number;
  played: PuzzleStepCard[];
  pitched: PuzzleStepCard[];
  blocked: PuzzleStepCard[];
}

export interface PuzzleLesson {
  theme: string;
  themeText: string;
  keyCards: PuzzleStepCard[];
  hints: string[];
  trick: string;
}

export interface PuzzleCandidate {
  id: number;
  createdAt: string;
  format: string;
  kind: PuzzleKind;
  turn: number;
  hero: string;
  heroName: string;
  opponentHero: string;
  opponentHeroName: string;
  status: number;
  life: number;
  hasLine: boolean;
  opponentLife: number;
  realLife: number;
  hand: PuzzleCard[];
  arsenal: PuzzleCard[];
  weapons: PuzzleCard[];
  equipment: PuzzleCard[];
  floating: number;
  actionPoints: number;
  handPitch: number;
  opponentEquipment: PuzzleCard[];
  opponentHand: PuzzleCard[];
  opponentEquipmentBlock: number;
  opponentHandBlock: number;
  opponentBlock: number;
  needed: number;
  spareCards: number | null;
  proof: PuzzleProof | null;
  solution: PuzzleStep[] | null;
  estimatedDamage: number;
  estimatedThrough: number;
  estimatedAttacks: number;
  gap: number;
  bot: PuzzleBot | null;
  filtered: boolean;
  lesson: PuzzleLesson | null;
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
  mode?: PuzzleMode;
}

export interface VerifyPuzzleCandidateRequest {
  candidateId: number;
}

export interface VerifyPuzzleCandidateResponse {
  proof?: PuzzleProof;
  error?: string;
}

export interface PuzzleScheduleStats {
  players: number;
  finished: number;
  solved: number;
  averageStars: number | null;
  ups: number;
  downs: number;
  best: number | null;
}

export interface PuzzleScheduleDay {
  date: string;
  candidateId: number;
  mode: PuzzleMode;
  heroName: string;
  opponentHeroName: string;
  life: number;
  difficulty: PuzzleDifficulty | '';
  theme: string | null;
  bars: { bot: number; real: number } | null;
  stats: PuzzleScheduleStats;
}

export interface PuzzleScheduleResponse {
  today: string;
  days: PuzzleScheduleDay[];
  scheduled?: string;
  error?: string;
}

export interface SchedulePuzzleRequest {
  action: 'schedule' | 'remove';
  candidateId?: number;
  mode?: PuzzleMode;
  date?: string;
}

export interface CreatePuzzleGameResponse {
  gameName: number;
  playerID: number;
  authKey: string;
  error?: string;
}

export type AdReportRange = 1 | 7 | 30 | 90;
export type AdDevice = 'desktop' | 'mobile';

export interface AdSlotStat {
  page: string;
  placement: string;
  device: AdDevice;
  mounts: number;
  seen: number;
  visibleMs: number;
  requests: number;
  filled: number;
  viewable: number;
  clicks: number;
  prebidWins: number;
  prebidMicros: number;
  estMicros: number;
  pricedFills: number;
}

export interface AdPageStat {
  page: string;
  device: AdDevice;
  views: number;
  visibleMs: number;
  adblockViews: number;
}

export interface AdBidderStat {
  bidder: string;
  device: AdDevice;
  bids: number;
  wins: number;
  winMicros: number;
}

export interface AdDailyStat {
  day: string;
  device: AdDevice;
  views: number;
  estMicros: number;
  unpricedFills: number;
  displayImpressions?: number;
  videoImpressions: number;
  videoViewable?: number;
  videoStarts?: number;
  videoCompletes?: number;
  rewardedShows: number;
}

export interface AdEventStat {
  page: string;
  placement: string;
  device: AdDevice;
  event: string;
  count: number;
}

export interface AdReportResponse {
  days: AdReportRange;
  since: string;
  slots: AdSlotStat[];
  pages: AdPageStat[];
  bidders: AdBidderStat[];
  events: AdEventStat[];
  daily: AdDailyStat[];
  error?: string;
}
