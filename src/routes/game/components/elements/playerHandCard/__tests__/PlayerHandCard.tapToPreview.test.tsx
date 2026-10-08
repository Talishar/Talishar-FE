import {
  createEvent,
  fireEvent,
  screen,
  waitFor
} from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import PlayerHandCard from '../PlayerHandCard';
import {
  TAP_TO_PREVIEW_PLAY_COOKIE,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey
} from '../tapToPreviewPlay';
import {
  clearCardPreview,
  getCardPreview
} from '../../cardPortal/cardPreviewStore';
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

const secondCard: Card = {
  cardNumber: 'WTR002',
  cardIndex: 1,
  action: 27,
  actionDataOverride: '1'
};

const tapCard = (el: HTMLElement) => {
  fireEvent.pointerDown(el, { pointerType: 'touch' });
  fireEvent.click(el);
};

const pressWith = (el: HTMLElement, pointerType: 'touch' | 'mouse') => {
  const down = createEvent.pointerDown(el);
  Object.defineProperty(down, 'pointerType', { value: pointerType });
  fireEvent(el, down);
  fireEvent.click(el);
};

const renderHandCard = (cookieEnabled: boolean) => {
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=${
    cookieEnabled ? 'true' : 'false'
  }; path=/`;
  const addCardToPlayedCards = vi.fn();
  const view = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={playableCard}
        cardId="hand-1"
        addCardToPlayedCards={addCardToPlayedCards}
        disableDrag
      />
    </CookiesProvider>
  );
  return { ...view, addCardToPlayedCards };
};

const renderTwoHandCards = () => {
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
  const addCardToPlayedCards = vi.fn();
  const view = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={playableCard}
        cardId="hand-1"
        addCardToPlayedCards={addCardToPlayedCards}
        disableDrag
      />
      <PlayerHandCard
        card={secondCard}
        cardId="hand-2"
        addCardToPlayedCards={addCardToPlayedCards}
        disableDrag
      />
    </CookiesProvider>
  );
  return { ...view, addCardToPlayedCards };
};

const renderFannedHoveredCard = () => {
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=false; path=/`;
  const addCardToPlayedCards = vi.fn();
  const onHoverChange = vi.fn();
  const onClickPlay = vi.fn();
  const view = renderWithProviders(
    <CookiesProvider>
      <PlayerHandCard
        card={playableCard}
        cardId="hand-1"
        addCardToPlayedCards={addCardToPlayedCards}
        isFanned
        isHovered
        fanSlot={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: 200 }}
        fanCardHeight={225}
        onHoverChange={onHoverChange}
        onClickPlay={onClickPlay}
        disableDrag
      />
    </CookiesProvider>
  );
  return { ...view, addCardToPlayedCards, onHoverChange, onClickPlay };
};

describe('PlayerHandCard tap to preview play', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
    clearCardPreview();
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it('plays immediately on tap when the option is disabled', async () => {
    const { store, addCardToPlayedCards } = renderHandCard(false);
    tapCard(screen.getByTestId('card-image'));

    await waitFor(() => {
      expect(addCardToPlayedCards).toHaveBeenCalledWith('WTR001');
    });
    expect(getCardPreview().popupOn).not.toBe(true);
  });

  it('tap A → preview A; tap A again → play A', async () => {
    const { store, addCardToPlayedCards } = renderHandCard(true);
    const cardImg = screen.getByTestId('card-image');

    tapCard(cardImg);

    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR001');
    });
    expect(addCardToPlayedCards).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toBe('id:hand-1');

    fireEvent.mouseLeave(cardImg);
    expect(getCardPreview().popupOn).toBe(true);

    tapCard(cardImg);

    await waitFor(() => {
      expect(addCardToPlayedCards).toHaveBeenCalledWith('WTR001');
    });
    expect(getTapToPreviewSelectedCardKey()).toBeNull();
  });

  it('tap A → preview A; tap B → preview B (does not play)', async () => {
    const { store, addCardToPlayedCards } = renderTwoHandCards();
    const images = screen.getAllByTestId('card-image');

    tapCard(images[0]);
    await waitFor(() => {
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR001');
    });

    tapCard(images[1]);
    await waitFor(() => {
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR002');
    });
    expect(addCardToPlayedCards).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toBe('id:hand-2');
  });

  it('dismisses sticky preview when tapping outside the hand', async () => {
    const { store, addCardToPlayedCards } = renderHandCard(true);
    tapCard(screen.getByTestId('card-image'));

    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
    });
    expect(getTapToPreviewSelectedCardKey()).toBe('id:hand-1');

    fireEvent.pointerDown(document.body, { pointerType: 'touch' });

    await waitFor(() => {
      expect(getCardPreview().popupOn).not.toBe(true);
    });
    expect(getTapToPreviewSelectedCardKey()).toBeNull();
    expect(addCardToPlayedCards).not.toHaveBeenCalled();
  });

  it('after outside dismiss, tapping A again previews instead of playing', async () => {
    const { store, addCardToPlayedCards } = renderHandCard(true);
    const cardImg = screen.getByTestId('card-image');

    tapCard(cardImg);
    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
    });

    fireEvent.pointerDown(document.body, { pointerType: 'touch' });
    await waitFor(() => {
      expect(getCardPreview().popupOn).not.toBe(true);
    });

    tapCard(cardImg);
    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR001');
    });
    expect(addCardToPlayedCards).not.toHaveBeenCalled();
  });
});

describe('fanned hovered card play', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
    clearCardPreview();
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it('touch play drops the hover instead of chaining', async () => {
    const { addCardToPlayedCards, onHoverChange, onClickPlay } =
      renderFannedHoveredCard();
    pressWith(screen.getByTestId('card-image'), 'touch');

    await waitFor(() => {
      expect(addCardToPlayedCards).toHaveBeenCalledWith('WTR001');
    });
    expect(onHoverChange).toHaveBeenCalledWith('hand-1', false);
    expect(onClickPlay).not.toHaveBeenCalled();
  });

  it('mouse play chains the hover to the next card', async () => {
    const { addCardToPlayedCards, onHoverChange, onClickPlay } =
      renderFannedHoveredCard();
    pressWith(screen.getByTestId('card-image'), 'mouse');

    await waitFor(() => {
      expect(addCardToPlayedCards).toHaveBeenCalledWith('WTR001');
    });
    expect(onClickPlay).toHaveBeenCalledWith('hand-1');
    expect(onHoverChange).not.toHaveBeenCalledWith('hand-1', false);
  });
});
