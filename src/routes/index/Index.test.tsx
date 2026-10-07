import React from 'react';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Index from './Index';

const state = vi.hoisted(() => ({
  auth: {
    isLoggedIn: true,
    isLoading: false,
    currentUserName: 'Player' as string | null
  },
  supporter: { isSupporter: false, showAds: false, isLoading: false },
  dispatch: vi.fn()
}));

vi.mock('app/Hooks', () => ({ useAppDispatch: () => state.dispatch }));
vi.mock('hooks/useAuth', () => ({ default: () => state.auth }));
vi.mock('hooks/useSupporterStatus', () => ({ default: () => state.supporter }));
vi.mock('hooks/useAdScript', () => ({ default: vi.fn() }));
vi.mock('features/api/apiSlice', () => ({
  useGetSystemMessageQuery: () => ({})
}));
vi.mock('./components/gameList', () => ({ default: () => <div>Games</div> }));
vi.mock('./components/gameList/GameList', () => ({ DEV_FAKE_MODE: false }));
vi.mock('./components/UnifiedGamePanel', () => ({
  default: () => <div>Game setup</div>
}));
vi.mock('./components/quickJoin/QuickJoinContext', () => ({
  QuickJoinProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}));
vi.mock('routes/news', () => ({ default: () => <div>News</div> }));
vi.mock('./components/CommunityContent', () => ({ default: () => null }));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>
  );
const preferenceKey = 'talishar_home_banner_hidden_v2_Player';

beforeEach(() => {
  localStorage.clear();
  state.auth = {
    isLoggedIn: true,
    isLoading: false,
    currentUserName: 'Player'
  };
  state.supporter = { isSupporter: false, showAds: false, isLoading: false };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([null, '1', '0'])(
  'paints the saved hero layout on its first render (%s)',
  (saved) => {
    if (saved !== null) localStorage.setItem(preferenceKey, saved);
    renderHome();
    expect(screen.queryByRole('img')).toBe(
      saved === '0' ? screen.getByRole('img') : null
    );
    expect(
      screen.getByRole('button', { pressed: saved !== '0' })
    ).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
  }
);

it('renders the cached layout while auth loads, then refreshes the cache', () => {
  localStorage.setItem('talishar_home_last_user_v1', 'Player');
  state.auth = { isLoggedIn: false, isLoading: true, currentUserName: null };
  const view = renderHome();
  expect(screen.getByText('News')).toBeInTheDocument();
  expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(2);
  expect(screen.queryByText('Game setup')).not.toBeInTheDocument();
  expect(screen.queryByText('Games')).not.toBeInTheDocument();
  state.auth.isLoading = false;
  state.auth.isLoggedIn = true;
  state.auth.currentUserName = 'Player';
  state.supporter.isLoading = true;
  view.rerender(
    <MemoryRouter>
      <Index />
    </MemoryRouter>
  );
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText('Game setup')).toBeInTheDocument();
  expect(screen.getByText('Games')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(localStorage.getItem('talishar_home_last_user_v1')).toBe('Player');
});

it('clears the cached layout when auth resolves to a guest', () => {
  localStorage.setItem('talishar_home_last_user_v1', 'Player');
  state.auth = { isLoggedIn: false, isLoading: true, currentUserName: null };
  const view = renderHome();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  state.auth.isLoading = false;
  view.rerender(
    <MemoryRouter>
      <Index />
    </MemoryRouter>
  );
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.queryByText('Games')).not.toBeInTheDocument();
  expect(localStorage.getItem('talishar_home_last_user_v1')).toBeNull();
});

it('renders the guest shell immediately when no layout is cached', () => {
  state.auth = { isLoggedIn: false, isLoading: true, currentUserName: null };
  renderHome();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByText('News')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Log in to play' })
  ).toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(1);
});

it('uses the remembered expanded banner before auth and preserves a toggle through resolution', () => {
  localStorage.setItem('talishar_home_last_user_v1', 'Player');
  localStorage.setItem(preferenceKey, '0');
  state.auth = { isLoggedIn: false, isLoading: true, currentUserName: null };
  const view = renderHome();
  expect(screen.getByRole('img')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { pressed: false }));
  state.auth = {
    isLoggedIn: true,
    isLoading: false,
    currentUserName: 'Player'
  };
  view.rerender(
    <MemoryRouter>
      <Index />
    </MemoryRouter>
  );
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(localStorage.getItem(preferenceKey)).toBe('1');
});

it('persists explicit banner toggles and applies a different user preference', () => {
  const view = renderHome();
  fireEvent.click(screen.getByRole('button', { pressed: true }));
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(localStorage.getItem(preferenceKey)).toBe('0');
  state.auth.currentUserName = 'OtherPlayer';
  view.rerender(
    <MemoryRouter>
      <Index />
    </MemoryRouter>
  );
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('always renders the expanded hero for guests', () => {
  localStorage.setItem(preferenceKey, '1');
  state.auth.isLoggedIn = false;
  renderHome();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Game setup')).toBeInTheDocument();
  expect(screen.queryByText('Games')).not.toBeInTheDocument();
});

it('uses the compact default when preference storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Unavailable');
  });
  renderHome();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { pressed: true }));
  expect(screen.getByRole('img')).toBeInTheDocument();
});
