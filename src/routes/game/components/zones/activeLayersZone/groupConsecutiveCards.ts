import { Card } from 'features/Card';

export interface CardGroup {
  cards: Card[];
  isPlayer: boolean;
}

// Group consecutive layers only when both their card and controller match.
export function groupConsecutiveCards(
  cards: Card[],
  playerID: number
): CardGroup[] {
  const groups: CardGroup[] = [];

  for (const card of cards) {
    const isPlayer = playerID === card.controller;
    const last = groups[groups.length - 1];
    const firstCardInLastGroup = last?.cards[0];

    if (
      firstCardInLastGroup?.cardNumber === card.cardNumber &&
      firstCardInLastGroup.controller === card.controller
    ) {
      last.cards.push(card);
    } else {
      groups.push({ cards: [card], isPlayer });
    }
  }

  return groups;
}
