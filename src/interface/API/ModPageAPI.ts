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

export type GameHealthRange = 1 | 7 | 30 | 90;

export interface MisclickContext {
  context: string;
  contextName: string;
  isCard: boolean;
  inputs: number;
  undos: number;
  fastUndos: number;
}

export interface MisclickStat {
  phase: string;
  mode: number;
  inputs: number;
  undos: number;
  fastUndos: number;
  avgUndoMs: number;
  score: number;
  contexts: MisclickContext[];
}

export interface SuspectCardStat {
  cardID: string;
  cardName: string;
  games: number;
  fixGames: number;
  score: number;
  life: number;
  ap: number;
  resources: number;
  draws: number;
  cards: number;
  arsenal: number;
  bugs: number;
}

export interface GameHealthReportResponse {
  days: GameHealthRange;
  since: string;
  games: number;
  inputs: number;
  undos: number;
  fastUndos: number;
  misclicks: MisclickStat[];
  cards: SuspectCardStat[];
  error?: string;
}
