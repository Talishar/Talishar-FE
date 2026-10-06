import React from 'react';
import { CookiesProvider } from 'react-cookie';
import { vi, describe, it, expect } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import PlayerHandCard from '../PlayerHandCard';
import styles from '../PlayerHandCard.module.css';
import { Card } from 'features/Card';
import { FAN_HOVER_SCALE } from '../../../zones/playerHand/fanLayout';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const CARD_HEIGHT = 240;

const card: Card = {
  cardNumber: 'WTR001',
  cardIndex: 0,
  action: 27,
  actionDataOverride: '0'
};

const renderSlot = (scale: number) => {
  const { container } = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={card}
        cardId="uid-h1"
        isFanned
        fanSlot={{ x: 0, y: 10, rotate: 0, scale, zIndex: 200 }}
        isHovered={scale > 1}
        fanCardHeight={CARD_HEIGHT}
      />
    </CookiesProvider>
  );
  return container.querySelector(`.${styles.fanSlot}`) as HTMLElement;
};

describe('PlayerHandCard fan slot size', () => {
  it('enlarges a hovered card through its layout size, not a scale transform', () => {
    const slot = renderSlot(FAN_HOVER_SCALE);

    expect(parseFloat(slot.style.height)).toBeCloseTo(
      CARD_HEIGHT * FAN_HOVER_SCALE
    );
    expect(parseFloat(slot.style.width)).toBeCloseTo(
      ((CARD_HEIGHT * 2) / 3) * FAN_HOVER_SCALE
    );
    expect(slot.style.transform).not.toMatch(/scale\(/);
  });

  it('keeps the visual centre where a scale transform would put it', () => {
    const slot = renderSlot(FAN_HOVER_SCALE);

    expect(slot.style.transform).toContain(
      `translateY(${10 + ((FAN_HOVER_SCALE - 1) * CARD_HEIGHT) / 2}px)`
    );
    expect(parseFloat(slot.style.marginLeft)).toBeCloseTo(
      (-((CARD_HEIGHT * 2) / 3) * FAN_HOVER_SCALE) / 2
    );
  });
});
