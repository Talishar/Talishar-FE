import React from 'react';
import { createEvent, fireEvent } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import PlayerHandCard from '../PlayerHandCard';
import styles from '../PlayerHandCard.module.css';
import { Card } from 'features/Card';
import {
  FAN_HOVER_HIT_RATIO,
  FAN_HOVER_SCALE,
  FanSlot
} from '../../../zones/playerHand/fanLayout';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const STAGE_BOTTOM = 1000;
const CARD_HEIGHT = 240;
const HOVER_LINE =
  STAGE_BOTTOM - CARD_HEIGHT * FAN_HOVER_SCALE * FAN_HOVER_HIT_RATIO;

const card: Card = {
  cardNumber: 'WTR001',
  cardIndex: 0,
  action: 27,
  actionDataOverride: '0'
};

const slot: FanSlot = { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 200 };

const firePointer = (
  type: 'pointerOver' | 'pointerMove' | 'pointerOut',
  target: Element,
  clientY: number,
  relatedTarget: Element | null = null
) => {
  const event = createEvent[type](target);
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  Object.defineProperty(event, 'clientY', { value: clientY });
  Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
  fireEvent(target, event);
};

const renderFanCard = (isHovered: boolean, fanHoverScale?: number) => {
  const onHoverChange = vi.fn();
  const { container } = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={card}
        cardId="uid-h1"
        isFanned
        fanSlot={slot}
        isHovered={isHovered}
        fanHoverScale={fanHoverScale}
        onHoverChange={onHoverChange}
      />
    </CookiesProvider>
  );
  const cardEl = container.querySelector('[data-hand-card-number]')!;
  const stage = cardEl.parentElement!.parentElement!;
  stage.getBoundingClientRect = () => ({ bottom: STAGE_BOTTOM } as DOMRect);
  return {
    container,
    cardEl,
    img: cardEl.querySelector('img')!,
    onHoverChange
  };
};

describe('PlayerHandCard fan hover line', () => {
  const offsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => CARD_HEIGHT
    });
  });

  afterAll(() => {
    if (offsetHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        'offsetHeight',
        offsetHeight
      );
    }
  });

  it('starts hover when the pointer enters below the line', () => {
    const { img, onHoverChange } = renderFanCard(false);

    firePointer('pointerOver', img, HOVER_LINE + 50);

    expect(onHoverChange).toHaveBeenCalledWith('uid-h1', true);
  });

  it('unhovers once the pointer rises above the line', () => {
    const { img, onHoverChange } = renderFanCard(true);

    firePointer('pointerMove', img, HOVER_LINE + 10);
    expect(onHoverChange).not.toHaveBeenCalled();

    firePointer('pointerMove', img, HOVER_LINE - 10);
    expect(onHoverChange).toHaveBeenCalledWith('uid-h1', false);
  });

  it('hovers again when the pointer comes back below the line', () => {
    const { img, onHoverChange } = renderFanCard(false);

    firePointer('pointerMove', img, HOVER_LINE + 10);

    expect(onHoverChange).toHaveBeenCalledWith('uid-h1', true);
  });

  it('ignores moves between parts of the card', () => {
    const { cardEl, img, onHoverChange } = renderFanCard(true);

    firePointer('pointerOut', img, HOVER_LINE + 10, cardEl);

    expect(onHoverChange).not.toHaveBeenCalled();
  });

  it('unhovers when the pointer leaves the card', () => {
    const { img, onHoverChange } = renderFanCard(true);

    firePointer('pointerOut', img, HOVER_LINE + 10, document.body);

    expect(onHoverChange).toHaveBeenCalledWith('uid-h1', false);
  });

  it('unhovers when the pointer moves anywhere outside the card', () => {
    const { img, onHoverChange } = renderFanCard(true);

    firePointer('pointerMove', img, HOVER_LINE + 10);
    expect(onHoverChange).not.toHaveBeenCalled();

    firePointer('pointerMove', document.body, HOVER_LINE + 10);
    expect(onHoverChange).toHaveBeenCalledWith('uid-h1', false);
  });

  it('unhovers when the pointer leaves the page', () => {
    const { onHoverChange } = renderFanCard(true);

    fireEvent.pointerLeave(document.documentElement);

    expect(onHoverChange).toHaveBeenCalledWith('uid-h1', false);
  });

  it('raises the line for a larger hover scale', () => {
    const scaledLine = STAGE_BOTTOM - CARD_HEIGHT * 2 * FAN_HOVER_HIT_RATIO;
    const between = STAGE_BOTTOM - CARD_HEIGHT * 1.75 * FAN_HOVER_HIT_RATIO;

    const above = renderFanCard(false, 2);
    firePointer('pointerMove', above.img, scaledLine - 10);
    expect(above.onHoverChange).not.toHaveBeenCalled();

    const inside = renderFanCard(false, 2);
    firePointer('pointerMove', inside.img, between);
    expect(inside.onHoverChange).toHaveBeenCalledWith('uid-h1', true);
  });

  it('counter-scales the keyword panel by the hover scale', () => {
    const { container } = renderFanCard(true, 2);

    const wrapper = container.querySelector<HTMLElement>(
      `.${styles.fanKeywords}`
    );

    expect(wrapper?.style.transform).toBe('scale(0.5)');
  });
});
