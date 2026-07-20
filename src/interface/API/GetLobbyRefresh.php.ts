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
  format?: string;
  gameDescription?: string;
  gameLog?: string;
  playAudio?: boolean;
  theirHero?: string;
  theirHeroName?: string;
  theirName?: string;
  theirNameColor?: string;
  theirOverlayUrl?: string;
  theirChannelLink?: string;
  theirIsContributor?: boolean;
  theirIsPatron?: string;
  theirIsPvtVoidPatron?: boolean;
  theirMetafyTiers?: string[];
  submitSideboard?: string;
  myPriority?: boolean;
  isMainGameReady?: boolean;
  canSubmitSideboard?: boolean;
  canUnreadySideboard?: boolean;
  myDeckLink?: string;
  matchups?: Matchup[];
  legalHeroes?: LegalHero[];
  chatEnabled?: boolean;
  chatInvited?: boolean;
  opponentIsTyping?: boolean;
  wasKicked?: boolean;
  sideboardWasReset?: boolean;
  isOpponentAI?: boolean;
}

export interface Matchup {
  matchupId: string;
  name: string;
  heroIdentifiers?: string[]; // hero slugs e.g. ["bravo-showstopper"]
  preferredTurnOrder?: string | null; // "1st", "2nd", or null
  notes?: string | null; // HTML notes from Fabrary
}

// Heroes the backend has determined are legal for the current deck's format.
// Already filtered: bans applied (via JoinGame.php isBannedInFormat),
// young/adult split applied for the format. The FE renders these directly
// as the discovery grid for Bazaar decks; no further filtering needed.
//
// If absent (older backend versions), the FE falls back to its local
// HEROES_OF_RATHE constant + young flag — without ban filtering.
export interface LegalHero {
  heroId: string;   // slug, e.g. "briar_warden_of_thorns"
  name: string;     // display name, e.g. "Briar Warden of Thorns"
  class: string;    // class name from CardClass(): "RUNEBLADE", "WIZARD", "ASSASSIN", etc.
  young?: boolean;  // optional; backend has already format-filtered, FE doesn't re-filter
}
