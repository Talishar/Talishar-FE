export const OSCILIO_VARIANTS = ['Combo', 'Spells'] as const;

export type OscilioVariant = '' | (typeof OSCILIO_VARIANTS)[number];

export const isOscilioHero = (heroName: string): boolean =>
  heroName === 'Oscilio' || heroName.startsWith('Oscilio, ');

export const hasOscilioHero = (heroNames: string[]): boolean =>
  heroNames.some(isOscilioHero);

export const formatSelectedHeroes = (
  heroNames: string[],
  oscilioVariant: OscilioVariant = ''
): string =>
  heroNames
    .map((heroName) =>
      oscilioVariant && isOscilioHero(heroName)
        ? `${heroName} (${oscilioVariant})`
        : heroName
    )
    .join(', ');

export const buildHeroGameDescription = (
  heroNames: string[],
  excludeHeroes: boolean,
  oscilioVariant: OscilioVariant = ''
): string => {
  const baseDescription = excludeHeroes
    ? 'No interest in playing against specific hero'
    : 'Looking to play against a specific hero';

  if (heroNames.length === 0) return baseDescription;

  const heroList = formatSelectedHeroes(
    heroNames,
    excludeHeroes ? '' : oscilioVariant
  );
  return excludeHeroes
    ? `No interest in playing against ${heroList}`
    : `Looking to play against ${heroList}`;
};
