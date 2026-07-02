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

export interface ModPageDataResponse {
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
