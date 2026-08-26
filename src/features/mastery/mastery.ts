import { HeroMasteryProgress } from 'interface/API/HeroMastery';

export const MASTERY_MILESTONES = [
  5, 10, 15, 25, 35, 50, 75, 100, 150, 200, 250, 350, 500, 750, 1000
];
export const ROMAN_LEVELS = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'
];

export const emptyMastery = (heroId: string): HeroMasteryProgress => ({
  heroId,
  qualifyingGames: 0,
  level: 0,
  displayLevel: null,
  frameLevel: 0,
  asset: null,
  nextThreshold: MASTERY_MILESTONES[0],
  gamesToNext: MASTERY_MILESTONES[0]
});

export const DEFAULT_FRAME = 'default';

export const masteryTitle = (level: number) =>
  level > 0 ? `Mastery ${ROMAN_LEVELS[level]}` : 'Hero Mastery';

export const progressStart = (level: number, milestones = MASTERY_MILESTONES) =>
  level > 0 ? milestones[level - 1] : 0;

export const masteryLevel = (
  qualifyingGames: number,
  milestones = MASTERY_MILESTONES
) => {
  let low = 0;
  let high = milestones.length;

  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (qualifyingGames >= milestones[middle]) low = middle + 1;
    else high = middle;
  }

  return low;
};

export const ornamentTier = (level: number) => {
  if (level >= MASTERY_MILESTONES.length) return 8;
  return level > 0 && level % 2 === 0 ? level / 2 : 0;
};

// Dev-only frame preview, e.g. /game/lobby/123?masteryLevel=9&opponentMasteryLevel=3
export const masteryLevelPreview = (param: string): number | null => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get(param);
  if (raw === null) return null;
  const level = Number(raw);
  const isValid =
    Number.isInteger(level) && level >= 0 && level <= MASTERY_MILESTONES.length;
  return isValid ? level : null;
};
