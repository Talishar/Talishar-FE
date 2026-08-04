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
  document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=${cookieEnabled ? 'true' : 'false'}; path=/`;
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
    fireEvent.click(screen.getByRole('button', { name: 'board-card' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(store.getState().game.popup?.popupOn).not.toBe(true);
  });

  it('tap board card → sticky preview; second tap runs onClick', async () => {
    const onClick = vi.fn();
    const { store } = renderBoardCard({ cookieEnabled: true, onClick });
    const card = screen.getByRole('button', { name: 'board-card' });

    fireEvent.click(card);

    await waitFor(() => {
      expect(store.getState().game.popup?.popupOn).toBe(true);
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR076');
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toBe('board:me:WTR076');

    fireEvent.mouseLeave(card);
    expect(store.getState().game.popup?.popupOn).toBe(true);

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

    fireEvent.click(screen.getByRole('button', { name: 'card-a' }));
    await waitFor(() => {
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR001');
    });

    fireEvent.click(screen.getByRole('button', { name: 'card-b' }));
    await waitFor(() => {
      expect(store.getState().game.popup?.popupCard?.cardNumber).toBe('WTR002');
    });
    expect(onClickA).not.toHaveBeenCalled();
    expect(onClickB).not.toHaveBeenCalled();
  });

  it('dismisses sticky board preview on outside tap', async () => {
    const onClick = vi.fn();
    const { store } = renderBoardCard({ cookieEnabled: true, onClick });
    fireEvent.click(screen.getByRole('button', { name: 'board-card' }));
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
});
