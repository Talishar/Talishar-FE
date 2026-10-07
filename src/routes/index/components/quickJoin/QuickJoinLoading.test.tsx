import React from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UnifiedGamePanel from '../UnifiedGamePanel';
import GameList from '../gameList/GameList';
import { QuickJoinProvider, useQuickJoin } from './QuickJoinContext';

const state = vi.hoisted(() => ({
  auth: { isLoggedIn: false, isLoading: true },
  userName: null as string | null,
  gamesLoading: false,
  gamesQuery: vi.fn(),
  favoritesLoading: false,
  favoritesQuery: vi.fn(),
  joinGame: vi.fn()
}));

vi.mock('hooks/useAuth', () => ({
  default: () => ({ ...state.auth, currentUserName: state.userName })
}));
vi.mock('hooks/useBlockedUsers', () => ({
  useBlockedUsers: () => ({ blockedUsers: [] })
}));
vi.mock('@formkit/auto-animate/react', () => ({
  useAutoAnimate: () => [null]
}));
vi.mock('../filter', () => ({ default: () => null }));
vi.mock('../gameList/GameFilter', () => ({ default: () => null }));
vi.mock('../openGame/OpenGame', () => ({ default: () => null }));
vi.mock('../inProgressGame', () => ({ default: () => null }));
vi.mock('hooks/useSupporterStatus', () => ({
  default: () => ({ isSupporter: false })
}));
vi.mock('hooks/useRustCounters', () => ({
  default: () => ({ canViewRustCounters: false, isRustLocked: false }),
  requestRustPanelAttention: vi.fn()
}));
vi.mock('app/Hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: () => unknown) => selector()
}));
vi.mock('features/auth/authSlice', () => ({
  selectCurrentUserName: () => state.userName,
  selectMetafyId: () => null,
  selectMetafyHash: () => null,
  selectMetafyTimestamp: () => null
}));
vi.mock('features/api/apiSlice', () => ({
  useGetGameListQuery: (_: unknown, options: unknown) => {
    state.gamesQuery(options);
    return { isLoading: state.gamesLoading, refetch: vi.fn() };
  },
  useGetFriendsListQuery: () => ({}),
  useGetFavoriteDecksQuery: (_: unknown, options: unknown) => {
    state.favoritesQuery(options);
    return { isLoading: state.favoritesLoading };
  },
  useGetBazaarDecksQuery: () => ({}),
  useGetHeroMasteryQuery: () => ({}),
  useJoinGameMutation: () => [state.joinGame],
  useClearRustCountersMutation: () => [vi.fn()]
}));
vi.mock('routes/game/create/CreateGame', () => ({
  default: () => <div>Creation form</div>
}));
vi.mock('components/RustCounterPanel', () => ({ default: () => null }));

const JoinButton = () => {
  const { quickJoin } = useQuickJoin();
  return <button onClick={() => quickJoin(123)}>Join test game</button>;
};

const homePanels = () => (
  <MemoryRouter>
    <QuickJoinProvider>
      <UnifiedGamePanel userLayout />
      <JoinButton />
    </QuickJoinProvider>
  </MemoryRouter>
);

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'unifiedGamePanelExpanded=true';
  state.auth = { isLoggedIn: false, isLoading: true };
  state.userName = null;
  state.favoritesLoading = false;
  state.gamesLoading = false;
  vi.clearAllMocks();
});
afterEach(cleanup);

it('keeps the real deck controls mounted through auth and deck loading', () => {
  const view = render(homePanels());
  const deckPicker = screen.getByRole('combobox');
  const creationForm = screen.getByText('Creation form');
  expect(deckPicker).toHaveAttribute('aria-busy', 'true');
  expect(state.favoritesQuery).toHaveBeenLastCalledWith({ skip: true });
  fireEvent.click(screen.getByText('Join test game'));
  expect(state.joinGame).not.toHaveBeenCalled();

  state.auth = { isLoggedIn: true, isLoading: false };
  // Auth response can arrive one render before Redux account credentials.
  view.rerender(homePanels());
  expect(deckPicker).toHaveAttribute('aria-busy', 'true');
  expect(state.favoritesQuery).toHaveBeenLastCalledWith({ skip: true });

  state.userName = 'Player';
  state.favoritesLoading = true;
  view.rerender(homePanels());
  expect(screen.getByRole('combobox')).toBe(deckPicker);
  expect(screen.getByText('Creation form')).toBe(creationForm);
  expect(deckPicker).toHaveAttribute('aria-busy', 'true');
  expect(state.favoritesQuery).toHaveBeenLastCalledWith({ skip: false });

  state.favoritesLoading = false;
  view.rerender(homePanels());
  expect(screen.getByRole('combobox')).toBe(deckPicker);
  expect(deckPicker).toHaveAttribute('aria-busy', 'false');
});

it('keeps the game list skeleton and header through auth and game loading', () => {
  const panels = () => (
    <MemoryRouter>
      <GameList />
    </MemoryRouter>
  );
  const view = render(panels());
  const loadingState = screen.getByRole('status');
  const refresh = screen.getByRole('button', { name: /Refresh/ });
  const tabs = screen
    .getAllByRole('button')
    .filter((button) => button.textContent?.includes('Looking for opponent'));
  expect(refresh).toBeDisabled();
  expect(state.gamesQuery).toHaveBeenLastCalledWith({ skip: true });

  state.auth = { isLoggedIn: true, isLoading: false };
  state.userName = 'Player';
  state.gamesLoading = true;
  view.rerender(panels());
  expect(screen.getByRole('status')).toBe(loadingState);
  expect(screen.getByRole('button', { name: /Refresh/ })).toBe(refresh);
  expect(tabs[0]).toBeInTheDocument();
  expect(state.gamesQuery).toHaveBeenLastCalledWith({ skip: false });
});
