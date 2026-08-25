import { RootState } from 'app/Store';
import { Card } from 'features/Card';

export const selectCardListLastUpdate = (state: RootState) =>
  state.game.gameDynamicInfo.lastUpdate;

const matchesQuery = (card: Card, normalizedQuery: string): boolean =>
  (card.cardName?.toLowerCase().includes(normalizedQuery) ?? false) ||
  (card.sType?.toLowerCase().includes(normalizedQuery) ?? false);

export const filterCardsByQuery = (
  cards: Card[] | null | undefined,
  searchQuery: string
): Card[] | null | undefined => {
  if (!cards || !searchQuery) return cards;
  const normalizedQuery = searchQuery.toLowerCase();
  return cards.filter((card) => matchesQuery(card, normalizedQuery));
};
