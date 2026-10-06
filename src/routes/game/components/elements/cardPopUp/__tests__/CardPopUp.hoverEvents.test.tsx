import React from 'react';
import { createEvent, fireEvent, screen } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import CardPopUp from '../CardPopUp';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const firePointer = (
  type: 'pointerOver' | 'pointerOut',
  target: HTMLElement,
  relatedTarget: Element | null
) => {
  const event = createEvent[type](target);
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
  fireEvent(target, event);
};

const renderCard = () => {
  const onHoverStart = vi.fn();
  const onHoverEnd = vi.fn();
  renderWithProviders(
    <CookiesProvider>
      <div data-testid="stage">
        <CardPopUp
          cardNumber="WTR076"
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        >
          <img data-testid="card" alt="" />
          <span data-testid="icon" />
        </CardPopUp>
      </div>
    </CookiesProvider>
  );
  return { onHoverStart, onHoverEnd };
};

describe('CardPopUp hover start/end', () => {
  it('starts hover when the element left behind was removed from the page', () => {
    const { onHoverStart } = renderCard();

    firePointer(
      'pointerOver',
      screen.getByTestId('card'),
      screen.getByTestId('stage')
    );

    expect(onHoverStart).toHaveBeenCalledTimes(1);
  });

  it('ignores moves between elements inside the card', () => {
    const { onHoverStart, onHoverEnd } = renderCard();
    const card = screen.getByTestId('card');
    const icon = screen.getByTestId('icon');

    firePointer('pointerOver', card, null);
    firePointer('pointerOut', card, icon);
    firePointer('pointerOver', icon, card);

    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onHoverEnd).not.toHaveBeenCalled();
  });

  it('ends hover when the pointer leaves the card', () => {
    const { onHoverEnd } = renderCard();
    const card = screen.getByTestId('card');

    firePointer('pointerOver', card, null);
    firePointer('pointerOut', card, screen.getByTestId('stage'));

    expect(onHoverEnd).toHaveBeenCalledTimes(1);
  });
});
