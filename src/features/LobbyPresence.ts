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
