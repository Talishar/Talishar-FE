import React from 'react';
import { Card } from 'features/Card';

export const subcardOverflowStyle = (
  cards?: Card[]
): React.CSSProperties | undefined => {
  let maxSubcardCount = 0;
  for (const card of cards ?? []) {
    const count = card.subcards?.filter(Boolean).length ?? 0;
    if (count > maxSubcardCount) maxSubcardCount = count;
  }
  if (maxSubcardCount === 0) return undefined;
  return {
    '--subcard-overflow': `calc(${maxSubcardCount * 0.18} * var(--card-size))`
  } as React.CSSProperties;
};
