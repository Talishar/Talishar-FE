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
import {
  clearCardPreview,
  getCardPreview
} from '../../cardPortal/cardPreviewStore';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const tapCard = (el: HTMLElement) => {
  fireEvent.pointerDown(el, { pointerType: 'touch' });
  fireEvent.click(el);
};

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
        <button type="button" data-testid="board-card" />
      </CardPopUp>
    </CookiesProvider>
  );
};

describe('CardPopUp board tap to preview', () => {
  beforeEach(() => {
    clearTapToPreviewSelection();
    clearCardPreview();
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it('fires onClick immediately when the option is off', () => {
    const onClick = vi.fn();
    renderBoardCard({ cookieEnabled: false, onClick });
    tapCard(screen.getByTestId('board-card'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getCardPreview().popupOn).not.toBe(true);
  });

  it('tap board card → sticky preview; second tap runs onClick', async () => {
    const onClick = vi.fn();
    renderBoardCard({ cookieEnabled: true, onClick });
    const card = screen.getByTestId('board-card');

    tapCard(card);

    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR076');
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toMatch(/^board:me:WTR076:/);

    fireEvent.mouseLeave(card);
    expect(getCardPreview().popupOn).toBe(true);

    tapCard(card);

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
    expect(getTapToPreviewSelectedCardKey()).toBeNull();
  });

  it('tap A then tap B switches board preview without activating A', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const onClickA = vi.fn();
    const onClickB = vi.fn();
    renderWithProviders(
      <CookiesProvider>
        <CardPopUp cardNumber="WTR001" onClick={onClickA}>
          <button type="button" data-testid="card-a" />
        </CardPopUp>
        <CardPopUp cardNumber="WTR002" onClick={onClickB}>
          <button type="button" data-testid="card-b" />
        </CardPopUp>
      </CookiesProvider>
    );

    const cardA = screen.getByTestId('card-a');
    const cardB = screen.getByTestId('card-b');
    tapCard(cardA);
    await waitFor(() => {
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR001');
    });

    tapCard(cardB);
    await waitFor(() => {
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR002');
    });
    expect(onClickA).not.toHaveBeenCalled();
    expect(onClickB).not.toHaveBeenCalled();
  });

  it('two instances of the same cardNumber stay distinct (no false confirm)', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const onClickA = vi.fn();
    const onClickB = vi.fn();
    renderWithProviders(
      <CookiesProvider>
        <CardPopUp cardNumber="WTR001" onClick={onClickA}>
          <button type="button" data-testid="dup-a" />
        </CardPopUp>
        <CardPopUp cardNumber="WTR001" onClick={onClickB}>
          <button type="button" data-testid="dup-b" />
        </CardPopUp>
      </CookiesProvider>
    );

    const cardA = screen.getByTestId('dup-a');
    const cardB = screen.getByTestId('dup-b');
    tapCard(cardA);
    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
    });
    const keyAfterA = getTapToPreviewSelectedCardKey();
    expect(keyAfterA).toMatch(/^board:me:WTR001:/);

    tapCard(cardB);
    await waitFor(() => {
      expect(getTapToPreviewSelectedCardKey()).not.toBe(keyAfterA);
    });
    expect(onClickA).not.toHaveBeenCalled();
    expect(onClickB).not.toHaveBeenCalled();
    expect(getCardPreview().popupCard?.cardNumber).toBe('WTR001');
  });

  it('dismisses sticky board preview on outside tap', async () => {
    const onClick = vi.fn();
    renderBoardCard({ cookieEnabled: true, onClick });
    const card = screen.getByTestId('board-card');
    tapCard(card);
    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
    });

    fireEvent.pointerDown(document.body);
    await waitFor(() => {
      expect(getCardPreview().popupOn).not.toBe(true);
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(getTapToPreviewSelectedCardKey()).toBeNull();
  });

  it('does not stopPropagation so parent click handlers still run', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const parentClick = vi.fn();
    const cardClick = vi.fn();
    renderWithProviders(
      <CookiesProvider>
        <div onClick={parentClick}>
          <CardPopUp cardNumber="WTR076" onClick={cardClick}>
            <button type="button" data-testid="zone-card" />
          </CardPopUp>
        </div>
      </CookiesProvider>
    );

    const card = screen.getByTestId('zone-card');
    tapCard(card);

    await waitFor(() => {
      expect(getCardPreview().popupOn).toBe(true);
    });
    expect(cardClick).not.toHaveBeenCalled();
    expect(parentClick).toHaveBeenCalled();
  });

  it('tapping a non-play CardPopUp dismisses then previews that card', async () => {
    document.cookie = `${TAP_TO_PREVIEW_PLAY_COOKIE}=true; path=/`;
    const onClickA = vi.fn();
    renderWithProviders(
      <CookiesProvider>
        <CardPopUp cardNumber="WTR001" onClick={onClickA}>
          <button type="button" data-testid="playable" />
        </CardPopUp>
        <CardPopUp cardNumber="WTR002">
          <button type="button" data-testid="effect" />
        </CardPopUp>
      </CookiesProvider>
    );

    const playable = screen.getByTestId('playable');
    const effect = screen.getByTestId('effect');
    tapCard(playable);
    await waitFor(() => {
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR001');
    });

    tapCard(effect);
    await waitFor(() => {
      expect(getCardPreview().popupCard?.cardNumber).toBe('WTR002');
    });
    expect(onClickA).not.toHaveBeenCalled();
  });
});
