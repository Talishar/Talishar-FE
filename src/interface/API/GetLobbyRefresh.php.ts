export interface GetLobbyRefresh {
  gameName?: number;
  playerID?: number;
  authKey?: string;
  lastUpdate?: number;
}

export interface GetLobbyRefreshResponse {
  lastUpdate?: number;
  amIChoosingFirstPlayer?: boolean;
  isPrivateLobby?: boolean;
  gameLog?: string;
  playAudio?: boolean;
  theirHero?: string;
  theirHeroName?: string;
  theirName?: string;
  theirNameColor?: string;
  theirOverlayUrl?: string;
  theirChannelLink?: string;
  submitSideboard?: string;
  myPriority?: boolean;
  isMainGameReady?: boolean;
  canSubmitSideboard?: boolean;
  myDeckLink?: string;
  matchups?: Matchup[];
  chatEnabled?: boolean;
  chatInvited?: boolean;
}

export interface Matchup {
  matchupId: string;
  name: string;
  preferredTurnOrder?: string | null;  // "1st", "2nd", or null
  notes?: string | null;  // HTML notes from Fabrary
}
