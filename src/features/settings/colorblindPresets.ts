export const COLORBLIND_PRESET = {
  OFF: 0,
  STANDARD: 1,
  DEUTERANOPIA: 2,
  PROTANOPIA: 3,
  TRITANOPIA: 4
} as const;

export type ColorblindPreset =
  (typeof COLORBLIND_PRESET)[keyof typeof COLORBLIND_PRESET];

const PRESET_BORDER_COLORS: Partial<Record<ColorblindPreset, string[]>> = {
  [COLORBLIND_PRESET.DEUTERANOPIA]: [
    '#33aaee',
    '#cc5599',
    '#eeaa11',
    '#ffeeee',
    '#cc5522',
    '#55bb88',
    '#8855aa',
    '#ffffaa',
    '#aa2244',
    '#ffbbff'
  ],
  [COLORBLIND_PRESET.PROTANOPIA]: [
    '#11bbff',
    '#ee1100',
    '#ff8811',
    '#ffeeff',
    '#118899',
    '#99ff11',
    '#bb22aa',
    '#dd7777',
    '#aa1144',
    '#88ffcc'
  ],
  [COLORBLIND_PRESET.TRITANOPIA]: [
    '#22eeff',
    '#ee2200',
    '#eeaa44',
    '#ffeeff',
    '#aa88ff',
    '#22aa00',
    '#6666cc',
    '#bbdd33',
    '#992255',
    '#cc22ee'
  ]
};

const STANDARD_CHART_COLORS = { you: '#4DA3FF', opponent: '#F0554E' };

export const parseColorblindPreset = (raw: unknown): ColorblindPreset => {
  const value = Number(raw);
  return value >= COLORBLIND_PRESET.STANDARD &&
    value <= COLORBLIND_PRESET.TRITANOPIA &&
    Number.isInteger(value)
    ? (value as ColorblindPreset)
    : COLORBLIND_PRESET.OFF;
};

export const presetBorderColors = (preset: ColorblindPreset) =>
  PRESET_BORDER_COLORS[preset];

export const presetChartColors = (preset: ColorblindPreset) => {
  if (preset === COLORBLIND_PRESET.OFF) return undefined;
  const borders = PRESET_BORDER_COLORS[preset];
  return borders
    ? { you: borders[0], opponent: borders[1] }
    : STANDARD_CHART_COLORS;
};
