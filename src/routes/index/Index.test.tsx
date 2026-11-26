import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Index from './Index';
import styles from './Index.module.css';

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
vi.mock('./components/gameList', () => ({
  default: () => <div data-testid="games" />
}));
vi.mock('./components/gameList/GameList', () => ({ DEV_FAKE_MODE: false }));
vi.mock('./components/UnifiedGamePanel', () => ({
  default: () => <div data-testid="game-setup" />
}));
vi.mock('./components/quickJoin/QuickJoinContext', () => ({
  QuickJoinProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}));
vi.mock('routes/news', () => ({ default: () => <div data-testid="news" /> }));
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
  'uses the signed-in layout regardless of the old banner preference (%s)',
  (saved) => {
    if (saved !== null) localStorage.setItem(preferenceKey, saved);
    const { container } = renderHome();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('games')).toBeInTheDocument();
    expect(container.querySelector('#games')).toHaveClass(
      styles.contentSectionSignedIn
    );
  }
);

it('uses the signed-in layout before the username is available', () => {
  state.auth.currentUserName = null;
  renderHome();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByTestId('games')).toBeInTheDocument();
});

it('renders the cached layout while auth loads, then refreshes the cache', () => {
  localStorage.setItem('talishar_home_last_user_v1', 'Player');
  state.auth = { isLoggedIn: false, isLoading: true, currentUserName: null };
  const view = renderHome();
  expect(screen.getByTestId('news')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  const setupPanel = screen.getByTestId('game-setup');
  const gameList = screen.getByTestId('games');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
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
  expect(screen.getByTestId('game-setup')).toBe(setupPanel);
  expect(screen.getByTestId('games')).toBe(gameList);
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
  expect(screen.queryByTestId('games')).not.toBeInTheDocument();
  expect(localStorage.getItem('talishar_home_last_user_v1')).toBeNull();
});

it('renders the guest shell immediately when no layout is cached', () => {
  state.auth = { isLoggedIn: false, isLoading: true, currentUserName: null };
  renderHome();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByTestId('news')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Log in to play' })
  ).toBeInTheDocument();
  expect(screen.getByTestId('game-setup')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('always renders the expanded hero for guests', () => {
  localStorage.setItem(preferenceKey, '1');
  state.auth.isLoggedIn = false;
  const { container } = renderHome();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Log in to play' })).toHaveAttribute(
    'href',
    '/user/login'
  );
  expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
    'href',
    '/user/login/signup'
  );
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(container.querySelector('#games')).not.toHaveClass(
    styles.contentSectionSignedIn
  );
  expect(screen.getByTestId('game-setup')).toBeInTheDocument();
  expect(screen.queryByTestId('games')).not.toBeInTheDocument();
});

it('uses the signed-in layout when storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Unavailable');
  });
  renderHome();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByTestId('games')).toBeInTheDocument();
});
