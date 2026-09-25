import React from 'react';
import { Card } from 'features/Card';

export const subcardOverflowStyle = (
  cards?: Card[]
): React.CSSProperties | undefined => {
  if (!cards) return undefined;
  let maxSubcardCount = 0;
  for (const card of cards) {
    let count = 0;
    const subcards = card.subcards;
    if (!subcards) continue;
    for (const subcard of subcards) {
      if (subcard) count++;
    }
    if (count > maxSubcardCount) maxSubcardCount = count;
  }
  if (maxSubcardCount === 0) return undefined;
  return {
    '--subcard-overflow': `calc(${maxSubcardCount * 0.18} * var(--card-size))`
  } as React.CSSProperties;
};
