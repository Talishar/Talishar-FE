import { useEffect, useRef } from 'react';
import { Card } from 'features/Card';

export const useNewlyDrawnCards = (handCards: Card[] | undefined): Set<string> => {
  const previousHandRef = useRef<Set<string>>(new Set());
  const newlyDrawnRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentCardNumbers = new Set(
      (handCards || [])
        .map(card => card.cardNumber)
    );

    const newCards = new Set<string>();
    currentCardNumbers.forEach(cardNum => {
      if (!previousHandRef.current.has(cardNum) || 
          (handCards?.filter(c => c.cardNumber === cardNum).length ?? 0) > 
          Array.from(previousHandRef.current).filter(c => c === cardNum).length) {
        newCards.add(cardNum);
      }
    });

    newlyDrawnRef.current = newCards;
    previousHandRef.current = currentCardNumbers;
  }, [handCards]);

  return newlyDrawnRef.current;
};
