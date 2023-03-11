import { Card } from './Card';

export interface GameDynamicInfo {
  turnNo?: number;
  lastPlayed?: Card;
  lastUpdate?: number;
}
