import {
  CARD_KEYWORD_MAP,
  KEYWORD_STRINGS
} from 'data/keywords/generated/cardKeywordMap';

export const useCardKeywords = (cardNumber?: string): string[] | undefined => {
  if (!cardNumber) return undefined;
  const indexes = CARD_KEYWORD_MAP[cardNumber];
  if (!indexes || indexes.length === 0) return undefined;
  return indexes.map((i) => KEYWORD_STRINGS[i]);
};
