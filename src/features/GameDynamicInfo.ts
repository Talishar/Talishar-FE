import { Card } from './Card';

export interface GameDynamicInfo {
  turnNo?: number;
  lastPlayed?: Card;
  lastUpdate?: number;
  clock?: number;
  spectatorCount?: number;
}
