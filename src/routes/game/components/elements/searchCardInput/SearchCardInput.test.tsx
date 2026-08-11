import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchCardInput from './SearchCardInput';
import { PROCESS_INPUT } from 'appConstants';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  gameFormat: 'futurecc',
  submitButton: vi.fn((payload) => ({ type: 'game/submitButton', payload }))
}));

vi.mock('app/Hooks', () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ game: { gameInfo: { gameFormat: mocks.gameFormat } } })
}));

vi.mock('features/game/GameSlice', () => ({
  submitButton: mocks.submitButton
}));

describe('SearchCardInput manual card names', () => {
  beforeEach(() => {
    mocks.dispatch.mockClear();
    mocks.submitButton.mockClear();
    mocks.gameFormat = 'futurecc';
  });

  it('allows a manually entered card name in a Future queue', () => {
    render(<SearchCardInput />);

    expect(
      screen.getByText(/new unreleased cards may not appear in the list/i)
    ).toBeInTheDocument();

    const manualInput = screen.getByLabelText('Enter a card name manually');
    const submitManualButton = screen.getByRole('button', {
      name: 'Submit name'
    });
    expect(submitManualButton).toBeDisabled();

    fireEvent.change(manualInput, { target: { value: '  Beta Card Name  ' } });
    fireEvent.click(submitManualButton);

    expect(mocks.submitButton).toHaveBeenCalledWith({
      button: {
        mode: PROCESS_INPUT.NAME_CARD,
        inputText: 'Beta Card Name'
      }
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'game/submitButton',
      payload: {
        button: {
          mode: PROCESS_INPUT.NAME_CARD,
          inputText: 'Beta Card Name'
        }
      }
    });
  });

  it('does not show manual entry outside Future queues', () => {
    mocks.gameFormat = 'cc';

    render(<SearchCardInput />);

    expect(
      screen.queryByLabelText('Enter a card name manually')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/new beta cards may not appear in this list/i)
    ).not.toBeInTheDocument();
  });
});
