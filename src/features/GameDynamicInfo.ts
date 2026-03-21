import { Card } from './Card';

export interface GameDynamicInfo {
  turnNo?: number;
  lastPlayed?: Card;
  recentlyPlayed?: Card[];
  lastUpdate?: number;
  clock?: number;
  spectatorCount?: number;
  playerInventory?: Card[];
}
