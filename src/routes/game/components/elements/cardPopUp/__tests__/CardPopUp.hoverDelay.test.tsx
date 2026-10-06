import React from 'react';
import { act, createEvent, fireEvent, screen } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import CardPopUp from '../CardPopUp';
import {
  clearCardPreview,
  getCardPreview
} from '../../cardPortal/cardPreviewStore';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const hoverWithPen = (el: HTMLElement) => {
  const event = createEvent.pointerOver(el);
  Object.defineProperty(event, 'pointerType', { value: 'pen' });
  fireEvent(el, event);
};

const renderCard = (hoverPreviewDelayMs?: number) =>
  renderWithProviders(
    <CookiesProvider>
      <CardPopUp cardNumber="WTR076" hoverPreviewDelayMs={hoverPreviewDelayMs}>
        <button type="button" data-testid="card" />
      </CardPopUp>
    </CookiesProvider>
  );

describe('CardPopUp hover preview delay', () => {
  beforeEach(() => {
    clearCardPreview();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the preview only after the delay elapses', () => {
    renderCard(150);
    hoverWithPen(screen.getByTestId('card'));

    act(() => vi.advanceTimersByTime(100));
    expect(getCardPreview().popupOn).not.toBe(true);

    act(() => vi.advanceTimersByTime(50));
    expect(getCardPreview()).toMatchObject({
      popupOn: true,
      popupCard: { cardNumber: 'WTR076' }
    });
  });

  it('shows nothing when the pointer leaves before the delay', () => {
    renderCard(150);
    const card = screen.getByTestId('card');
    hoverWithPen(card);

    act(() => vi.advanceTimersByTime(100));
    fireEvent.mouseLeave(card);
    act(() => vi.advanceTimersByTime(200));

    expect(getCardPreview().popupOn).not.toBe(true);
  });

  it('shows the preview immediately without a delay', () => {
    renderCard(0);
    hoverWithPen(screen.getByTestId('card'));

    expect(getCardPreview().popupOn).toBe(true);
  });
});
