import { Card } from 'features/Card';

export const prepareCards = (cards: Card[]): Card[] =>
  cards.map(
    (card, index) =>
      ({
        ...card,
        borderColor: '8',
        uniqueId: `${card.cardNumber}-${index}`
      } as Card)
  );
