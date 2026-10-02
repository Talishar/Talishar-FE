import {
  PuzzleDifficulty,
  PuzzleMode,
  PuzzleStep,
  PuzzleStepCard
} from './ModPageAPI';

export interface DailyPuzzleBars {
  bot: number;
  real: number;
  best: number;
}

export interface DailyPuzzleInfo {
  number: number;
  mode: PuzzleMode;
  format: string;
  hero: string;
  heroName: string;
  opponentHero: string;
  opponentHeroName: string;
  life: number;
  difficulty: PuzzleDifficulty | '';
  hintsTotal: number;
  bars: DailyPuzzleBars | null;
}

export interface DailyPuzzleStats {
  players: number;
  finished: number;
  solved: number;
  averageStars: number | null;
}

export interface DailyPuzzleResult {
  finished: boolean;
  solved: boolean;
  stars: number;
  hints: number;
  tries: number;
  damage: number | null;
  rating: number;
}

export interface DailyPuzzleLesson {
  theme: string | null;
  themeText: string | null;
  keyCards: PuzzleStepCard[];
  hints: string[];
  trick: string;
  solution: PuzzleStep[];
}

export interface DailyPuzzleLeader {
  name: string;
  damage: number;
  stars: number;
  hints: number;
}

export interface DailyPuzzleResponse {
  date: string;
  loggedIn: boolean;
  nextIn: number;
  puzzle: DailyPuzzleInfo | null;
  stats?: DailyPuzzleStats;
  result?: DailyPuzzleResult | null;
  lesson?: DailyPuzzleLesson;
  leaderboard?: DailyPuzzleLeader[];
  error?: string;
}

export interface StartDailyPuzzleResponse {
  gameName: number;
  playerID: number;
  authKey: string;
  practice: boolean;
  error?: string;
}

export interface RateDailyPuzzleRequest {
  rating: -1 | 0 | 1;
}

export interface RateDailyPuzzleResponse {
  rating?: number;
  error?: string;
}

export interface PuzzleHintResponse {
  hint: string | null;
  index: number;
  total: number;
}
