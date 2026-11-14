import { TFunction } from 'i18next';
import { normalizeFormat } from 'appConstants';
import { getReadableFormatName } from 'utils/formatUtils';

// Set IDs of the heroes each format allows, from GetLegalHeroes.php?by=setId.
export type LegalHeroIds = Record<string, string[]>;

const SUMMARY_FORMATS = [
  { format: 'cc', labelKey: 'DECK_LEGALITY.FORMATS.CC' },
  { format: 'llcc', labelKey: 'DECK_LEGALITY.FORMATS.LL' },
  { format: 'sage', labelKey: 'DECK_LEGALITY.FORMATS.SAGE' },
  { format: 'blitz', labelKey: 'DECK_LEGALITY.FORMATS.BLITZ' },
  { format: 'gage', labelKey: 'DECK_LEGALITY.FORMATS.GAGE' }
];

const FUTURE_FORMATS = [
  {
    format: 'futurecc',
    base: 'cc',
    labelKey: 'DECK_LEGALITY.FORMATS.FUTURE_CC'
  },
  {
    format: 'futurell',
    base: 'llcc',
    labelKey: 'DECK_LEGALITY.FORMATS.FUTURE_LL'
  },
  {
    format: 'futuresage',
    base: 'sage',
    labelKey: 'DECK_LEGALITY.FORMATS.FUTURE_SAGE'
  }
];

// Limited and precon decks come from the lobby itself, so the hero isn't checked there.
const UNCHECKED_FORMATS = new Set(['draft', 'sealed', 'precon']);

const allows = (legalIds: LegalHeroIds, format: string, heroId: string) =>
  legalIds[format]?.includes(heroId) ?? false;

// true/false when the format restricts heroes, null when it can't be told.
export const isHeroLegalIn = (
  heroId: string | null | undefined,
  format: string | null | undefined,
  legalIds: LegalHeroIds | undefined
): boolean | null => {
  const key = normalizeFormat(format);
  if (!heroId || !key || !legalIds || UNCHECKED_FORMATS.has(key)) return null;
  if (!legalIds[key]) return null;
  return allows(legalIds, key, heroId);
};

export interface LegalFormat {
  format: string;
  labelKey: string;
}

export interface HeroLegalitySummary {
  legal: LegalFormat[];
  futureOnly: LegalFormat[];
}

// null when the hero isn't one GetLegalHeroes knows about.
export const getHeroLegalitySummary = (
  heroId: string | null | undefined,
  legalIds: LegalHeroIds | undefined
): HeroLegalitySummary | null => {
  if (!heroId || !legalIds) return null;
  if (!Object.values(legalIds).some((ids) => ids.includes(heroId))) return null;
  return {
    legal: SUMMARY_FORMATS.filter(({ format }) =>
      allows(legalIds, format, heroId)
    ),
    futureOnly: FUTURE_FORMATS.filter(
      ({ format, base }) =>
        allows(legalIds, format, heroId) && !allows(legalIds, base, heroId)
    ).map(({ format, labelKey }) => ({ format, labelKey }))
  };
};

export const describeHeroLegality = (
  summary: HeroLegalitySummary
): { key: string; formats: LegalFormat[] } => {
  if (summary.legal.length > 0) {
    return {
      key: 'DECK_LEGALITY.LEGAL_FOR',
      formats: [...summary.legal, ...summary.futureOnly]
    };
  }
  if (summary.futureOnly.length > 0) {
    return { key: 'DECK_LEGALITY.ONLY_LEGAL_IN', formats: summary.futureOnly };
  }
  return { key: 'DECK_LEGALITY.ONLY_OPEN', formats: [] };
};

const FORMAT_LABEL_KEYS: Record<string, string> = {
  cc: 'GAME_LIST.FORMATS.CC',
  compcc: 'GAME_LIST.FORMATS.COMPETITIVE_CC',
  blitz: 'GAME_LIST.FORMATS.BLITZ',
  compblitz: 'GAME_LIST.FORMATS.COMPETITIVE_BLITZ',
  llcc: 'GAME_LIST.FORMATS.LL',
  compllcc: 'GAME_LIST.FORMATS.COMPETITIVE_LL',
  sage: 'GAME_LIST.FORMATS.SAGE',
  compsage: 'GAME_LIST.FORMATS.COMPETITIVE_SAGE',
  futurecc: 'GAME_LIST.FORMATS.FUTURE_CC',
  futuresage: 'GAME_LIST.FORMATS.FUTURE_SAGE',
  gage: 'GAME_LIST.FORMATS.GAGE'
};

export const formatDisplayName = (
  t: TFunction,
  format: string | null | undefined
): string => {
  const key = normalizeFormat(format) ?? '';
  return FORMAT_LABEL_KEYS[key]
    ? t(FORMAT_LABEL_KEYS[key])
    : getReadableFormatName(key);
};
