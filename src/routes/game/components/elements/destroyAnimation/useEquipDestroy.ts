import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

export type EquipDestroySlot =
  | 'Head'
  | 'Chest'
  | 'Arms'
  | 'Legs'
  | 'LWep'
  | 'RWep';

const SLOT_ALIASES: Record<string, EquipDestroySlot> = {
  Head: 'Head',
  Chest: 'Chest',
  Arms: 'Arms',
  Legs: 'Legs',
  LWep: 'LWep',
  RWep: 'RWep',
  'Off-Hand': 'RWep'
};

export const normalizeEquipSlot = (slot: string) => SLOT_ALIASES[slot] ?? '';

// playerOne is always the bottom half of the board, so map the absolute
// controller id coming from the server onto the zone being rendered.
export const useZonePlayerID = (isPlayer: boolean) => {
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const bottomPlayerID = playerID === 2 ? 2 : 1;
  return isPlayer ? bottomPlayerID : 3 - bottomPlayerID;
};

export const useEquipDestroy = (slot: EquipDestroySlot, isPlayer: boolean) => {
  const zonePlayerID = useZonePlayerID(isPlayer);
  return useAppSelector(
    (state: RootState) => state.game.equipDestroy?.[`${zonePlayerID}:${slot}`]
  );
};
