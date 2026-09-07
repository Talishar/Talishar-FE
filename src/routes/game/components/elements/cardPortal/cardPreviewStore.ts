import { useSyncExternalStore } from 'react';
import { Card } from 'features/Card';

export type CardPreviewState = {
  popupOn: boolean;
  popupCard?: Card;
  xCoord?: number;
  yCoord?: number;
  isOpponent?: boolean;
  presentation?: 'floating' | 'mobile-modal';
};

const CLOSED: CardPreviewState = { popupOn: false, popupCard: undefined };

let snapshot: CardPreviewState = CLOSED;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
};

const getSnapshot = () => snapshot;

export function setCardPreview(next: {
  cardNumber: string;
  xCoord?: number;
  yCoord?: number;
  isOpponent?: boolean;
  presentation?: 'floating' | 'mobile-modal';
}): void {
  const previous = snapshot;
  const presentation = next.presentation ?? 'floating';
  if (
    previous.popupOn &&
    previous.popupCard?.cardNumber === next.cardNumber &&
    previous.xCoord === next.xCoord &&
    previous.yCoord === next.yCoord &&
    previous.isOpponent === next.isOpponent &&
    previous.presentation === presentation
  ) {
    return;
  }

  snapshot = {
    popupOn: true,
    popupCard: { cardNumber: next.cardNumber },
    xCoord: next.xCoord,
    yCoord: next.yCoord,
    isOpponent: next.isOpponent,
    presentation
  };
  emit();
}

export function clearCardPreview(): void {
  if (snapshot === CLOSED) return;
  snapshot = CLOSED;
  emit();
}

export function useCardPreview(): CardPreviewState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCardPreview(): CardPreviewState {
  return snapshot;
}
