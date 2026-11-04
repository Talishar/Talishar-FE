import { ColorblindPreset, presetBorderColors } from './colorblindPresets';

export const CARD_BORDER_COLORS_COOKIE = 'cardBorderColors';

/** Indexed by the borderColor number the backend sends, minus one. */
export const DEFAULT_CARD_BORDER_COLORS = [
  '#00bfff',
  '#ff0000',
  '#ffa500',
  '#c5cbcf',
  '#d2b48c',
  '#7fff00',
  '#800080',
  '#ffd700',
  '#c00606',
  '#159b19'
];

export type CardBorderOverrides = Record<string, string>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const defaultBorderColor = (id: string) =>
  DEFAULT_CARD_BORDER_COLORS[Number(id) - 1];

export const presetBorderColor = (id: string, preset: ColorblindPreset) =>
  (presetBorderColors(preset) ?? DEFAULT_CARD_BORDER_COLORS)[Number(id) - 1];

export const parseBorderOverrides = (raw: unknown): CardBorderOverrides => {
  let source = raw;
  if (typeof raw === 'string') {
    try {
      source = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!source || typeof source !== 'object') return {};
  const overrides: CardBorderOverrides = {};
  Object.entries(source as Record<string, unknown>).forEach(([id, value]) => {
    if (
      defaultBorderColor(id) &&
      typeof value === 'string' &&
      HEX_COLOR.test(value)
    ) {
      overrides[id] = value.toLowerCase();
    }
  });
  return overrides;
};

export const borderColorVar = (id: string) => `--card-border-${id}`;
