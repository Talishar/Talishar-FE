export interface LobbyPresenceOptions {
  hasOpponent: boolean;
  isSideboarding: boolean;
  opponentReady: boolean;
  opponentUnready: boolean;
  bothReady: boolean;
  opponentChoosingFirstPlayer?: boolean;
  isEquipmentPhase?: boolean;
}

export function getLobbyPresenceMessage({
  hasOpponent,
  isSideboarding,
  opponentReady,
  opponentUnready,
  bothReady,
  opponentChoosingFirstPlayer,
  isEquipmentPhase
}: LobbyPresenceOptions): string | null {
  if (!hasOpponent) return null;
  if (bothReady) return 'Both players are ready - starting game';
  if (opponentChoosingFirstPlayer)
    return 'Opponent is choosing who goes first';
  if (!isSideboarding) return null;
  if (opponentUnready) return 'Opponent unready';
  if (opponentReady) return 'Opponent is ready';
  if (isEquipmentPhase) return 'Opponent is choosing arena cards';
  return 'Opponent is sideboarding';
}

export interface SelfPresenceOptions {
  isSideboarding: boolean;
  isEquipmentPhase: boolean;
  mySubmitted: boolean;
  bothReady: boolean;
  choosingFirstPlayer: boolean;
}

export function getSelfUnconfirmedPhase({
  isSideboarding,
  isEquipmentPhase,
  mySubmitted,
  bothReady,
  choosingFirstPlayer
}: SelfPresenceOptions): 'equipment' | 'deck' | null {
  if (!isSideboarding) return null;
  if (bothReady || choosingFirstPlayer) return null;
  if (mySubmitted) return null;
  return isEquipmentPhase ? 'equipment' : 'deck';
}
