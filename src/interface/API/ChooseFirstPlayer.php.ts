export interface ChooseFirstPlayer {
  gameName?: number;
  playerID?: number;
  authKey?: string;
  action: 'Go First' | 'Go Second';
}
