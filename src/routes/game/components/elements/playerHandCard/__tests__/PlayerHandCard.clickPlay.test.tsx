import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import PlayerHandCard from '../PlayerHandCard';
import {
  TAP_TO_PREVIEW_PLAY_COOKIE,
  clearTapToPreviewSelection
} from '../tapToPreviewPlay';
import { clearCardPreview } from '../../cardPortal/cardPreviewStore';
import { Card } from 'features/Card';
import { playCard } from 'features/game/GameSlice';
import InitialGameState from 'features/game/InitialGameState';
import { globalInitialState } from 'app/Store';
import { FanSlot } from '../../../zones/playerHand/fanLayout';

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

const slot: FanSlot = { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 200 };

const renderFanCard = ({
  isHovered = true,
  isArsenal = false
}: { isHovered?: boolean; isArsenal?: boolean } = {}) => {
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=false; path=/`;
  const onClickPlay = vi.fn();
  const view = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={playableCard}
        cardId="uid-h1"
        isFanned
        fanSlot={slot}
        isHovered={isHovered}
        isArsenal={isArsenal}
        onClickPlay={onClickPlay}
      />
    </CookiesProvider>
  );
  return { ...view, onClickPlay };
};

describe('PlayerHandCard click play handover', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
    clearCardPreview();
    vi.mocked(playCard).mockClear();
  });

  it('reports a click on the hovered fanned hand card', () => {
    const { onClickPlay } = renderFanCard();

    fireEvent.click(screen.getByTestId('card-image'));

    expect(onClickPlay).toHaveBeenCalledTimes(1);
    expect(onClickPlay).toHaveBeenCalledWith('uid-h1');
  });

  it('does not report a click on a card that is not hovered', () => {
    const { onClickPlay } = renderFanCard({ isHovered: false });

    fireEvent.click(screen.getByTestId('card-image'));

    expect(playCard).toHaveBeenCalledTimes(1);
    expect(onClickPlay).not.toHaveBeenCalled();
  });

  it('does not report a click on an arsenal card', () => {
    const { onClickPlay } = renderFanCard({ isArsenal: true });

    fireEvent.click(screen.getByTestId('card-image'));

    expect(playCard).toHaveBeenCalledTimes(1);
    expect(onClickPlay).not.toHaveBeenCalled();
  });

  it('ignores a click while player input is in progress outside the block step', async () => {
    const { store, onClickPlay } = renderFanCard();
    const cardImg = screen.getByTestId('card-image');

    fireEvent.click(cardImg);
    await waitFor(() => {
      expect(store.getState().game.isPlayerInputInProgress).toBe(true);
    });

    fireEvent.click(cardImg);
    expect(playCard).toHaveBeenCalledTimes(1);
    expect(onClickPlay).toHaveBeenCalledTimes(1);
  });

  it('queues a click while player input is in progress in the block step', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=false; path=/`;
    const first: Card = { ...playableCard, uniqueId: 'h0' };
    const second: Card = {
      ...playableCard,
      cardIndex: 1,
      actionDataOverride: '1',
      uniqueId: 'h1'
    };
    const onClickPlay = vi.fn();
    const { store } = renderWithProviders(
      <CookiesProvider>
        {[first, second].map((card) => (
          <PlayerHandCard
            key={card.uniqueId}
            card={card}
            cardId={`uid-${card.uniqueId}`}
            isFanned
            fanSlot={slot}
            isHovered
            onClickPlay={onClickPlay}
          />
        ))}
      </CookiesProvider>,
      {
        preloadedState: {
          ...globalInitialState,
          game: {
            ...InitialGameState,
            turnPhase: { turnPhase: 'B' },
            playerOne: { Hand: [first, second] }
          }
        }
      }
    );
    const [firstImg, secondImg] = screen.getAllByTestId('card-image');

    fireEvent.click(firstImg);
    await waitFor(() => {
      expect(store.getState().game.isPlayerInputInProgress).toBe(true);
    });

    fireEvent.click(secondImg);
    expect(playCard).toHaveBeenCalledTimes(1);
    expect(store.getState().game.queuedHandPlays).toHaveLength(1);
    expect(store.getState().game.queuedHandPlays?.[0].card.uniqueId).toBe('h1');
    expect(onClickPlay).toHaveBeenCalledTimes(2);
    expect(onClickPlay).toHaveBeenLastCalledWith('uid-h1');
  });
});
