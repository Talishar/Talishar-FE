import { HeroMasteryProgress } from 'interface/API/HeroMastery';

export const MASTERY_MILESTONES = [5, 15, 25, 50, 100, 150, 250, 500, 1000];
export const ROMAN_LEVELS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

export const emptyMastery = (heroId: string): HeroMasteryProgress => ({
  heroId,
  qualifyingGames: 0,
  level: 0,
  asset: null,
  nextThreshold: MASTERY_MILESTONES[0],
  gamesToNext: MASTERY_MILESTONES[0]
});

export const masteryTitle = (level: number) =>
  level > 0 ? `Mastery ${ROMAN_LEVELS[level]}` : 'Hero Mastery';

export const progressStart = (level: number, milestones = MASTERY_MILESTONES) =>
  level > 0 ? milestones[level - 1] : 0;
