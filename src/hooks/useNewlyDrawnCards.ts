import { useEffect, useRef } from 'react';
import { Card } from 'features/Card';

export const useNewlyDrawnCards = (
  handCards: Card[] | undefined
): Set<string> => {
  const previousHandRef = useRef<Set<string>>(new Set());
  const newlyDrawnRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const cards = handCards ?? [];
    const currentCardNumbers = new Set(cards.map((card) => card.cardNumber));

    const handCountMap = new Map<string, number>();
    for (const card of cards) {
      handCountMap.set(card.cardNumber, (handCountMap.get(card.cardNumber) ?? 0) + 1);
    }

    const newCards = new Set<string>();
    currentCardNumbers.forEach((cardNum) => {
      const currentCount = handCountMap.get(cardNum) ?? 0;
      const prevCount = previousHandRef.current.has(cardNum) ? 1 : 0;
      if (!previousHandRef.current.has(cardNum) || currentCount > prevCount) {
        newCards.add(cardNum);
      }
    });

    newlyDrawnRef.current = newCards;
    previousHandRef.current = currentCardNumbers;
  }, [handCards]);

  return newlyDrawnRef.current;
};
