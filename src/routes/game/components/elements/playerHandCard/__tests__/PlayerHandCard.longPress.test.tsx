import React from 'react';
import { createEvent, fireEvent, screen } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import PlayerHandCard from '../PlayerHandCard';
import {
  TAP_TO_PREVIEW_PLAY_COOKIE,
  clearTapToPreviewSelection
} from '../tapToPreviewPlay';
import { clearCardPreview } from '../../cardPortal/cardPreviewStore';
import { playCard } from 'features/game/GameSlice';
import { Card } from 'features/Card';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

vi.mock('../../cardImage/CardImage', () => ({
  default: ({ src, className }: { src: string; className?: string }) => (
    <img src={src} className={className} data-testid="card-image" alt="" />
  )
}));

vi.mock('features/game/GameSlice', async () => {
  const actual = await vi.importActual<
    typeof import('features/game/GameSlice')
  >('features/game/GameSlice');
  return {
    ...actual,
    playCard: Object.assign(
      vi.fn(() => ({
        type: 'game/playCard/pending',
        meta: {},
        payload: undefined
      })),
      {
        pending: actual.playCard.pending,
        fulfilled: actual.playCard.fulfilled,
        rejected: actual.playCard.rejected
      }
    )
  };
});

const playableCard: Card = {
  cardNumber: 'WTR001',
  cardIndex: 0,
  action: 27,
  actionDataOverride: '0'
};

const touchDown = (el: HTMLElement) => {
  const down = createEvent.pointerDown(el);
  Object.defineProperty(down, 'pointerType', { value: 'touch' });
  fireEvent(el, down);
};

const touchUp = (el: HTMLElement) => {
  const up = createEvent.pointerUp(el);
  Object.defineProperty(up, 'pointerType', { value: 'touch' });
  fireEvent(el, up);
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const renderFannedCard = () => {
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=false; path=/`;
  return renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={playableCard}
        cardId="hand-1"
        addCardToPlayedCards={vi.fn()}
        isFanned
        disableDrag
        fanSlot={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: 200 }}
        fanCardHeight={200}
        onTouchScrubStart={vi.fn()}
        onHoverChange={vi.fn()}
      />
    </CookiesProvider>
  );
};

describe('PlayerHandCard long press flag', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
    clearCardPreview();
    vi.mocked(playCard).mockClear();
  });

  it('a quick tap after a hold plays', async () => {
    renderFannedCard();
    const image = screen.getByTestId('card-image');

    touchDown(image);
    await wait(300);
    touchUp(image);
    await wait(50);

    touchDown(image);
    touchUp(image);
    fireEvent.click(image);

    expect(playCard).toHaveBeenCalledTimes(1);
  });

  it('a hold plays nothing', async () => {
    renderFannedCard();
    const image = screen.getByTestId('card-image');

    touchDown(image);
    await wait(300);
    touchUp(image);
    fireEvent.click(image);

    expect(playCard).not.toHaveBeenCalled();
  });
});
