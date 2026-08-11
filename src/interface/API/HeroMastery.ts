export interface HeroMasteryProgress {
  heroId: string;
  qualifyingGames: number;
  level: number;
  asset: string | null;
  nextThreshold: number | null;
  gamesToNext: number | null;
}

export interface HeroMasteryAward {
  heroId: string;
  gamesBefore: number;
  gamesAfter: number;
  levelBefore: number;
  levelAfter: number;
  unlocked: boolean;
  nextThreshold: number | null;
  gamesToNext: number | null;
}

export interface HeroMasteryResponse {
  milestones: number[];
  heroes: HeroMasteryProgress[];
  heroGroups: {
    classicConstructed: string[];
    silverAge: string[];
    livingLegend: string[];
  };
  gameAward?: HeroMasteryAward | null;
  gamePlayers?: Record<string, { heroId: string; level: number }>;
}
