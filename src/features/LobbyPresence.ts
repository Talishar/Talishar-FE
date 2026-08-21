export interface LobbyPresenceOptions {
  hasOpponent: boolean;
  isSideboarding: boolean;
  opponentReady: boolean;
  opponentUnready: boolean;
  bothReady: boolean;
}

export function getLobbyPresenceMessage({
  hasOpponent,
  isSideboarding,
  opponentReady,
  opponentUnready,
  bothReady
}: LobbyPresenceOptions): string | null {
  if (!hasOpponent) return null;
  if (bothReady) return 'Both players are ready - starting game';
  if (!isSideboarding) return null;
  if (opponentUnready) return 'Opponent unready';
  if (opponentReady) return 'Opponent is ready';
  return 'Opponent is sideboarding';
}
