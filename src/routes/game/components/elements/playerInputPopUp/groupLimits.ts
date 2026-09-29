import { Card } from 'features/Card';

export const withinGroupLimits = (
  cards: Card[] | undefined,
  checkedState: boolean[],
  limits: Record<string, number> | undefined
): boolean => {
  if (!limits || !cards) return true;
  const counts: Record<string, number> = {};
  for (let index = 0; index < checkedState.length; index += 1) {
    const group = checkedState[index] ? cards[index]?.limitGroup : undefined;
    if (!group) continue;
    counts[group] = (counts[group] ?? 0) + 1;
    if (limits[group] !== undefined && counts[group] > limits[group]) {
      return false;
    }
  }
  return true;
};
