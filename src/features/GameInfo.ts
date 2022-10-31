import Card from './Card';

export default interface GameInfo {
  gameID: number;
  playerID: number;
  authKey: string;
  turnNo?: number;
  lastPlayed?: Card;
  lastUpdate?: number;
}
