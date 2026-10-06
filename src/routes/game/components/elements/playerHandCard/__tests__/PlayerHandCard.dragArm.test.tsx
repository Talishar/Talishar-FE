import React from 'react';
import { act, createEvent, fireEvent } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { vi, describe, it, expect } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import PlayerHandCard from '../PlayerHandCard';
import { Card } from 'features/Card';
import { FanSlot } from '../../../zones/playerHand/fanLayout';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const card: Card = {
  cardNumber: 'WTR001',
  cardIndex: 0,
  action: 27,
  actionDataOverride: '0',
  uniqueId: 'h1'
};

const slot: FanSlot = { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 200 };

const firePointer = (
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  target: EventTarget,
  x: number,
  y: number
) => {
  const event = createEvent[type](target as Element);
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  Object.defineProperty(event, 'isPrimary', { value: true });
  Object.defineProperty(event, 'button', { value: 0 });
  Object.defineProperty(event, 'clientX', { value: x });
  Object.defineProperty(event, 'clientY', { value: y });
  Object.defineProperty(event, 'pageX', { value: x });
  Object.defineProperty(event, 'pageY', { value: y });
  fireEvent(target as Element, event);
};

const nextFrames = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 60)));

const renderFanCard = () => {
  const onHandReorderDragStart = vi.fn();
  const onHandReorderDragCancel = vi.fn();
  const onDragPlayStateChange = vi.fn();
  const { container } = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={card}
        cardId="uid-h1"
        isFanned
        fanSlot={slot}
        fanCardHeight={254}
        onHandReorderDragStart={onHandReorderDragStart}
        onHandReorderDragCancel={onHandReorderDragCancel}
        onDragPlayStateChange={onDragPlayStateChange}
      />
    </CookiesProvider>
  );
  return {
    cardEl: container.querySelector('[data-hand-card-number]') as Element,
    onHandReorderDragStart,
    onHandReorderDragCancel,
    onDragPlayStateChange
  };
};

const mouseGesture = async (target: Element, dx: number) => {
  firePointer('pointerDown', target, 500, 900);
  await nextFrames();
  firePointer('pointerMove', window, 500 + dx, 900);
  await nextFrames();
  firePointer('pointerUp', window, 500 + dx, 900);
  await nextFrames();
};

describe('PlayerHandCard mouse drag arming', () => {
  it('arms and ends a drag that passes the tolerance on its first frame', async () => {
    const {
      cardEl,
      onHandReorderDragStart,
      onHandReorderDragCancel,
      onDragPlayStateChange
    } = renderFanCard();

    await mouseGesture(cardEl, 40);

    expect(onHandReorderDragStart).toHaveBeenCalledTimes(1);
    expect(onHandReorderDragCancel).toHaveBeenCalledTimes(1);
    expect(onDragPlayStateChange).toHaveBeenLastCalledWith('idle');
  });

  it('keeps a small press after a drag from starting a drag', async () => {
    const { cardEl, onHandReorderDragStart, onDragPlayStateChange } =
      renderFanCard();

    await mouseGesture(cardEl, 40);
    const callsAfterDrag = onDragPlayStateChange.mock.calls.length;
    await mouseGesture(cardEl, 5);

    expect(onHandReorderDragStart).toHaveBeenCalledTimes(1);
    expect(onDragPlayStateChange).toHaveBeenCalledTimes(callsAfterDrag);
    expect(onDragPlayStateChange).toHaveBeenLastCalledWith('idle');
  });
});
