import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
  }
}));
vi.mock('hooks/useAuth', () => ({ default: () => state.auth }));
vi.mock('features/api/apiSlice', () => ({
  useGetPendingRequestsQuery: () => ({})
}));
vi.mock('components/header/LanguageSelector', () => ({ default: () => null }));
vi.mock('components/footer/Footer', () => ({ default: () => null }));
vi.mock('components/CookieConsent', () => ({ default: () => null }));
vi.mock('components/AdBlockingRecovery', () => ({ default: () => null }));
vi.mock('components/ads/VideoAdDock', () => ({ default: () => null }));
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
});
