export const OSCILIO_VARIANTS = ['Combo', 'Spells'] as const;

export type OscilioVariant = '' | (typeof OSCILIO_VARIANTS)[number];

export const isOscilioHero = (heroName: string): boolean =>
  heroName === 'Oscilio' || heroName.startsWith('Oscilio, ');

export const hasOscilioHero = (heroNames: string[]): boolean =>
  heroNames.some(isOscilioHero);

export const heroFirstName = (name: string): string => {
  const first = name.split(/[\s,]/)[0];
  if (first === 'Dr.' || first === 'Ser') {
    return name.split(/[\s,]/).slice(0, 2).join(' ');
  }
  return first;
};

// Full hero names can contain commas, so split on known names rather than
// treating every comma as a separator between selections.
export const parseHeroNames = (
  text: string,
  knownNames: string[]
): string[] | null => {
  const sortedNames = [...new Set(knownNames)].sort(
    (a, b) => b.length - a.length
  );
  const result: string[] = [];
  let remaining = text.trim();
  while (remaining) {
    const name = sortedNames.find(
      (candidate) =>
        remaining === candidate ||
        remaining.startsWith(`${candidate}, `) ||
        remaining.startsWith(`${candidate} (`)
    );
    if (!name) return null;
    remaining = remaining.slice(name.length);
    const variant = remaining.match(/^ \((Combo|Spells)\)/);
    if (variant) remaining = remaining.slice(variant[0].length);
    result.push(variant ? `${name}${variant[0]}` : name);
    if (!remaining) break;
    if (!remaining.startsWith(', ')) return null;
    remaining = remaining.slice(2);
  }
  return result;
};

export const shortenHeroNames = (
  text: string,
  legalNames: string[],
  knownNames: string[] = legalNames
): string => {
  const parsed = parseHeroNames(text, knownNames);
  if (!parsed) return text;
  const firstNameCounts = new Map<string, number>();
  for (const name of new Set(legalNames)) {
    const first = heroFirstName(name);
    firstNameCounts.set(first, (firstNameCounts.get(first) ?? 0) + 1);
  }
  return parsed
    .map((name) => {
      const variant = name.match(/ \((Combo|Spells)\)$/)?.[0] ?? '';
      const fullName = name.slice(0, name.length - variant.length);
      const first = heroFirstName(fullName);
      return legalNames.includes(fullName) && firstNameCounts.get(first) === 1
        ? `${first}${variant}`
        : name;
    })
    .join(', ');
};

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
