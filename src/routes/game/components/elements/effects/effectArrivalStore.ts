import { useSyncExternalStore } from 'react';
import { Card } from 'features/Card';

export type EffectSide = 'player' | 'opponent';
type ArrivalState = 'arriving';

const states = new Map<string, ArrivalState>();
const listeners = new Set<() => void>();

const id = (side: EffectSide, key: string) => `${side}:${key}`;

const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setEffectArrival = (
  side: EffectSide,
  key: string,
  state: ArrivalState | null
) => {
  if (state === null) {
    if (!states.delete(id(side, key))) return;
  } else {
    if (states.get(id(side, key)) === state) return;
    states.set(id(side, key), state);
  }
  emit();
};

export const useEffectArrival = (
  side: EffectSide,
  key: string | undefined
): ArrivalState | undefined =>
  useSyncExternalStore(subscribe, () =>
    key === undefined ? undefined : states.get(id(side, key))
  );

export const effectKeys = (effects: Card[]): string[] => {
  const seen = new Map<string, number>();
  return effects.map((card) => {
    const occurrence = seen.get(card.cardNumber) ?? 0;
    seen.set(card.cardNumber, occurrence + 1);
    return card.uniqueId && card.uniqueId !== '-'
      ? card.uniqueId
      : `${card.cardNumber}#${occurrence}`;
  });
};
