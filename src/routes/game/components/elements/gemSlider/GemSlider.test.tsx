import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROCESS_INPUT } from 'appConstants';
import GemSlider from './GemSlider';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  playerID: 1,
  submitButton: vi.fn((payload) => ({ type: 'game/submitButton', payload }))
}));

vi.mock('app/Hooks', () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ game: { gameInfo: { playerID: mocks.playerID } } })
}));

vi.mock('features/game/GameSlice', () => ({
  getGameInfo: (state: { game: { gameInfo: unknown } }) => state.game.gameInfo,
  submitButton: mocks.submitButton
}));

describe('GemSlider', () => {
  beforeEach(() => {
    mocks.dispatch.mockClear();
    mocks.submitButton.mockClear();
    mocks.playerID = 1;
  });

  it('exposes the active state and toggles equipment', () => {
    render(<GemSlider gem="active" cardID="test-card" />);

    const button = screen.getByRole('button', {
      name: 'Card ability active. Click to deactivate.'
    });

    expect(button).toHaveAttribute('aria-pressed', 'true');
    fireEvent.focus(button);
    expect(
      screen.getByText('Card ability active. Click to deactivate.')
    ).toBeInTheDocument();
    fireEvent.blur(button);
    fireEvent.click(button);

    expect(mocks.submitButton).toHaveBeenCalledWith({
      button: {
        buttonInput: 'test-card',
        mode: PROCESS_INPUT.TOGGLE_EQUIPMENT_ACTIVE
      }
    });
  });

  it('describes an inactive permanent and uses the player toggle mode', () => {
    render(
      <GemSlider
        gem="inactive"
        cardID="test-card"
        zone="MYITEMS"
        controller={1}
      />
    );

    const button = screen.getByRole('button', {
      name: 'Card ability inactive. Click to activate.'
    });

    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);

    expect(mocks.submitButton).toHaveBeenCalledWith({
      button: {
        buttonInput: 'MYITEMS-test-card',
        mode: PROCESS_INPUT.TOGGLE_PERMANENT_ACTIVE
      }
    });
  });
});
