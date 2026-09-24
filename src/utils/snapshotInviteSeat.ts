const keyForGame = (gameID: number) => `talishar_snapshot_seat_${gameID}`;

export interface SnapshotInviteSeat {
  playerID: 1 | 2;
  authKey: string;
}

export const saveSnapshotInviteSeat = (
  gameID: number,
  seat: SnapshotInviteSeat
): void => {
  sessionStorage.setItem(keyForGame(gameID), JSON.stringify(seat));
};

export const loadSnapshotInviteSeat = (
  gameID: number
): SnapshotInviteSeat | null => {
  try {
    const stored = sessionStorage.getItem(keyForGame(gameID));
    if (!stored) return null;
    const seat = JSON.parse(stored) as SnapshotInviteSeat;
    return (seat.playerID === 1 || seat.playerID === 2) &&
      /^[0-9a-f]{64}$/.test(seat.authKey)
      ? seat
      : null;
  } catch {
    return null;
  }
};
