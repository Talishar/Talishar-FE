import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react';
import { lazy } from 'react';
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider
} from 'react-router-dom';
import { vi } from 'vitest';
import Header from './Header';

const state = vi.hoisted(() => ({
  auth: {
    isLoggedIn: false,
    isLoading: true,
    isMod: false,
    currentUserName: null as string | null,
    currentDisplayName: null,
    logOut: vi.fn()
  },
  pendingRequests: [] as { requesterUserId: number }[],
  refetchFriends: vi.fn()
}));
vi.mock('hooks/useAuth', () => ({ default: () => state.auth }));
vi.mock('features/api/apiSlice', () => ({
  useGetPendingRequestsQuery: () => ({
    data: { requests: state.pendingRequests }
  }),
  useGetFriendsListQuery: () => ({ refetch: state.refetchFriends })
}));
vi.mock('components/header/LanguageSelector', () => ({ default: () => null }));
vi.mock('components/footer/Footer', () => ({ default: () => null }));
vi.mock('components/CookieConsent', () => ({ default: () => null }));
vi.mock('components/AdBlockingRecovery', () => ({ default: () => null }));
vi.mock('components/SessionRecovery', () => ({ default: () => null }));
vi.mock(
  'routes/game/components/elements/ambientParticles/AmbientParticles',
  () => ({ AmbientParticles: () => null })
);

beforeEach(() => {
  localStorage.clear();
  state.auth.isLoggedIn = false;
  state.auth.isLoading = true;
  state.auth.currentUserName = null;
  state.pendingRequests = [];
});
afterEach(() => cleanup());

it('keeps returning-user navigation links mounted while auth resolves', () => {
  localStorage.setItem('talishar_home_last_user_v1', 'Player');
  const view = render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  const replay = screen.getByRole('link', { name: 'Replays' });
  const mastery = screen.getByRole('link', { name: 'Mastery' });
  state.auth.isLoading = false;
  state.auth.isLoggedIn = true;
  state.auth.currentUserName = 'Player';
  view.rerender(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  expect(screen.getByRole('link', { name: 'Replays' })).toBe(replay);
  expect(screen.getByRole('link', { name: 'Mastery' })).toBe(mastery);
});

it('removes cached account links when the session has expired', () => {
  localStorage.setItem('talishar_home_last_user_v1', 'Player');
  const view = render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  state.auth.isLoading = false;
  view.rerender(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
  expect(
    screen.queryByRole('link', { name: 'Replays' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: 'Mastery' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /open friends list/i })
  ).not.toBeInTheDocument();
});

it('shows pending friend requests on the Profile menu entry', () => {
  state.auth.isLoggedIn = true;
  state.auth.isLoading = false;
  state.auth.currentUserName = 'Player';
  state.pendingRequests = [
    { requesterUserId: 1 },
    { requesterUserId: 2 }
  ];

  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: /Player/ }));
  const profileLink = screen.getByRole('link', { name: /Profile/ });
  expect(
    within(profileLink).getByLabelText('2 pending friend requests')
  ).toHaveTextContent('2');
});

it('keeps Play and the header visible while a tab is still loading', async () => {
  let finishLoading!: (page: { default: () => JSX.Element }) => void;
  const pendingTab = new Promise<{ default: () => JSX.Element }>((resolve) => {
    finishLoading = resolve;
  });
  const Learn = lazy(() => pendingTab);
  const router = createMemoryRouter([
    {
      element: <Header />,
      children: [
        { path: '/', element: <main>Play content</main> },
        { path: '/learn', element: <Learn /> }
      ]
    }
  ]);
  render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

  const learnLink = screen.getByRole('link', { name: 'Learn' });
  fireEvent.click(learnLink);
  expect(learnLink).toBeVisible();
  expect(screen.getByText('Play content')).toBeVisible();

  await act(async () => {
    finishLoading({ default: () => <main>Learn content</main> });
  });

  expect(screen.getByText('Learn content')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Learn' })).toBe(learnLink);
  expect(learnLink).toHaveAttribute('aria-current', 'page');

  await act(() => router.navigate(-1));
  expect(screen.getByText('Play content')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

it('keeps Friends mounted across tabs without a floating video slot', () => {
  state.auth.isLoggedIn = true;
  state.auth.isLoading = false;
  state.auth.currentUserName = 'Player';

  const router = createMemoryRouter([{ path: '*', element: <Header /> }]);
  render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

  const friends = screen.getByRole('button', { name: /open friends list/i });
  expect(document.getElementById('talishar-video-ad')).toBeNull();

  for (const name of ['Replays', 'Match History', 'Mastery', 'Learn', 'About']) {
    const tab = screen.getByRole('link', { name });
    fireEvent.click(tab);
    expect(tab).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /open friends list/i })).toBe(
      friends
    );
    expect(document.getElementById('talishar-video-ad')).toBeNull();
  }

  fireEvent.click(screen.getByRole('link', { name: 'Play' }));
  expect(document.getElementById('talishar-video-ad')).toBeNull();
  expect(screen.getByRole('button', { name: /open friends list/i })).toBe(friends);
});
