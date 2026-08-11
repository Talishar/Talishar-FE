export const MELD_CARDS = new Set<string>([
  'thistle_bloom__life_yellow',
  'arcane_seeds__life_red',
  'burn_up__shock_red',
  'pulsing_aether__life_red',
  'comet_storm__shock_red',
  'regrowth__shock_blue',
  'everbloom__life_blue',
  'consign_to_cosmos__shock_yellow'
]);

export const isMeldCard = (cardNumber?: string): boolean =>
  cardNumber != null && MELD_CARDS.has(cardNumber);
