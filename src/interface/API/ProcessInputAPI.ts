import { Setting } from 'features/options/optionsSlice';

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
