import { fireEvent, screen, waitFor } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import CardPopUp from '../CardPopUp';
import {
  TAP_TO_PREVIEW_PLAY_COOKIE,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey
} from '../../playerHandCard/tapToPreviewPlay';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const renderBoardCard = ({
  cookieEnabled,
  cardNumber = 'WTR076',
  onClick
}: {
  cookieEnabled: boolean;
  cardNumber?: string;
  onClick?: () => void;
}) => {
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=${
    cookieEnabled ? 'true' : 'false'
  }; path=/`;
  return renderWithProviders(
    <CookiesProvider>
      <CardPopUp cardNumber={cardNumber} onClick={onClick}>
        <button type="button">board-card</button>
      </CardPopUp>
    </CookiesProvider>
  );
};

describe('CardPopUp board tap to preview', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it('fires onClick immediately when the option is off', () => {
    const onClick = vi.fn();
    const { store } = renderBoardCard({ cookieEnabled: false, onClick });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'board-card' }), {
      pointerType: 'touch'
    });
    fireEvent.click(screen.getByRole('button', { name: 'board-card' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(store.getState().game.popup?.popupOn).not.toBe(true);
  });

  it('tap board card → sticky preview; second tap runs onClick', async () => {
    const onClick = vi.fn();
    const { store } = renderBoardCard({ cookieEnabled: true, onClick });
    const card = screen.getByRole('button', { name: 'board-card' });

    fireEvent.pointerDown(card, { pointerType: 'touch' });
    fireEvent.click(card);

    await waitFor(() => {
      expect(store.getState().game.popup?.popupOn).toBe(true);
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR076');
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toMatch(/^board:me:WTR076:/);

    fireEvent.mouseLeave(card);
    expect(store.getState().game.popup?.popupOn).toBe(true);

    fireEvent.pointerDown(card, { pointerType: 'touch' });
    fireEvent.click(card);

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
    expect(getTapToPreviewSelectedCardKey()).toBeNull();
  });

  it('tap A then tap B switches board preview without activating A', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const onClickA = vi.fn();
    const onClickB = vi.fn();
    const { store } = renderWithProviders(
      <CookiesProvider>
        <CardPopUp cardNumber="WTR001" onClick={onClickA}>
          <button type="button">card-a</button>
        </CardPopUp>
        <CardPopUp cardNumber="WTR002" onClick={onClickB}>
          <button type="button">card-b</button>
        </CardPopUp>
      </CookiesProvider>
    );

    const cardA = screen.getByRole('button', { name: 'card-a' });
    const cardB = screen.getByRole('button', { name: 'card-b' });
    fireEvent.pointerDown(cardA, { pointerType: 'touch' });
    fireEvent.click(cardA);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR001');
    });

    fireEvent.pointerDown(cardB, { pointerType: 'touch' });
    fireEvent.click(cardB);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR002');
    });
    expect(onClickA).not.toHaveBeenCalled();
    expect(onClickB).not.toHaveBeenCalled();
  });

  it('two instances of the same cardNumber stay distinct (no false confirm)', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const onClickA = vi.fn();
    const onClickB = vi.fn();
    const { store } = renderWithProviders(
      <CookiesProvider>
        <CardPopUp cardNumber="WTR001" onClick={onClickA}>
          <button type="button">dup-a</button>
        </CardPopUp>
        <CardPopUp cardNumber="WTR001" onClick={onClickB}>
          <button type="button">dup-b</button>
        </CardPopUp>
      </CookiesProvider>
    );

    const cardA = screen.getByRole('button', { name: 'dup-a' });
    const cardB = screen.getByRole('button', { name: 'dup-b' });
    fireEvent.pointerDown(cardA, { pointerType: 'touch' });
    fireEvent.click(cardA);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupOn).toBe(true);
    });
    const keyAfterA = getTapToPreviewSelectedCardKey();
    expect(keyAfterA).toMatch(/^board:me:WTR001:/);

    fireEvent.pointerDown(cardB, { pointerType: 'touch' });
    fireEvent.click(cardB);
    await waitFor(() => {
      expect(getTapToPreviewSelectedCardKey()).not.toBe(keyAfterA);
    });
    expect(onClickA).not.toHaveBeenCalled();
    expect(onClickB).not.toHaveBeenCalled();
    expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR001');
  });

  it('dismisses sticky board preview on outside tap', async () => {
    const onClick = vi.fn();
    const { store } = renderBoardCard({ cookieEnabled: true, onClick });
    const card = screen.getByRole('button', { name: 'board-card' });
    fireEvent.pointerDown(card, { pointerType: 'touch' });
    fireEvent.click(card);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupOn).toBe(true);
    });

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupOn).not.toBe(true);
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toBeNull();
  });

  it('does not stopPropagation so parent click handlers still run', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const parentClick = vi.fn();
    const cardClick = vi.fn();
    const { store } = renderWithProviders(
      <CookiesProvider>
        <div onClick={parentClick}>
          <CardPopUp cardNumber="WTR076" onClick={cardClick}>
            <button type="button">zone-card</button>
          </CardPopUp>
        </div>
      </CookiesProvider>
    );

    const card = screen.getByRole('button', { name: 'zone-card' });
    fireEvent.pointerDown(card, { pointerType: 'touch' });
    fireEvent.click(card);

    await waitFor(() => {
      expect(store.getState().game.popup?.popupOn).toBe(true);
    });
    expect(cardClick).not.toHaveBeenCalled();
    expect(parentClick).toHaveBeenCalled();
  });

  it('tapping a non-play CardPopUp dismisses then previews that card', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const onClickA = vi.fn();
    const { store } = renderWithProviders(
      <CookiesProvider>
        <CardPopUp cardNumber="WTR001" onClick={onClickA}>
          <button type="button">playable</button>
        </CardPopUp>
        <CardPopUp cardNumber="WTR002">
          <button type="button">effect</button>
        </CardPopUp>
      </CookiesProvider>
    );

    const playable = screen.getByRole('button', { name: 'playable' });
    const effect = screen.getByRole('button', { name: 'effect' });
    fireEvent.pointerDown(playable, { pointerType: 'touch' });
    fireEvent.click(playable);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR001');
    });

    fireEvent.pointerDown(effect, { pointerType: 'touch' });
    fireEvent.click(effect);
    await waitFor(() => {
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR002');
    });
    expect(onClickA).not.toHaveBeenCalled();
  });
});
