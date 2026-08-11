import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SpectatorLoginRequired from './SpectatorLoginRequired';

const mockState = {
  playerID: 3 as number,
  userName: null as string | null
};

vi.mock('app/Hooks', () => ({
  useAppSelector: (selector: unknown) => (selector as () => unknown)()
}));

vi.mock('features/game/GameSlice', () => ({
  getGameInfo: () => ({ playerID: mockState.playerID, gameID: 2869 })
}));

vi.mock('features/auth/authSlice', () => ({
  selectCurrentUserName: () => mockState.userName
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

const renderNotice = () =>
  render(
    <MemoryRouter>
      <SpectatorLoginRequired />
    </MemoryRouter>
  );

const advancePastGracePeriod = () =>
  act(() => {
    vi.advanceTimersByTime(3000);
  });

describe('SpectatorLoginRequired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('explains the empty board to a logged-out spectator', () => {
    mockState.playerID = 3;
    mockState.userName = null;

    renderNotice();
    advancePastGracePeriod();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('SPECTATOR.LOGIN_REQUIRED_TITLE')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'SPECTATOR.LOGIN_REQUIRED_ACTION' })
    ).toHaveAttribute('href', '/user/login');
    expect(
      screen.getByRole('link', { name: 'SPECTATOR.LOGIN_REQUIRED_HOME' })
    ).toHaveAttribute('href', '/');
  });

  it('stays quiet while the game is still loading', () => {
    mockState.playerID = 3;
    mockState.userName = null;

    renderNotice();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stays out of the way once the spectator is logged in', () => {
    mockState.playerID = 3;
    mockState.userName = 'someplayer';

    renderNotice();
    advancePastGracePeriod();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('never shows for an actual player', () => {
    mockState.playerID = 1;
    mockState.userName = null;

    renderNotice();
    advancePastGracePeriod();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
