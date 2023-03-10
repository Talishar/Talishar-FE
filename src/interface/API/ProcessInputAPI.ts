import { Setting } from 'interface/GameOptions';

export interface ProcessInputAPI {
  playerID: number;
  gameName: number;
  authKey: string;
  mode: number;
  submission: Submission;
}

export interface Submission {
  settings: Setting[];
}
