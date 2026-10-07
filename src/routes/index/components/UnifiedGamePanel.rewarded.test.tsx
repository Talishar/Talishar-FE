import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import UnifiedGamePanel from './UnifiedGamePanel';

const state = vi.hoisted(() => ({
  rustCounters: 1,
  isSupporter: false
}));

vi.mock('hooks/useAuth', () => ({
  default: () => ({ isLoggedIn: true })
}));
vi.mock('hooks/useRustCounters', () => ({
  default: () => ({ canViewRustCounters: true, rustCounters: state.rustCounters }),
  RUST_PANEL_ATTENTION_EVENT: 'talishar:rustPanelAttention',
  MAX_RUST_COUNTERS: 3
}));
vi.mock('hooks/useSupporterStatus', () => ({
  default: () => ({ isSupporter: state.isSupporter })
}));
vi.mock('features/api/apiSlice', () => ({
  useClearRustCountersMutation: () => [vi.fn()]
}));
vi.mock('components/RustCounterPanel', () => ({
  default: () => <button id="clearRust">Watch Ad to Clear</button>
}));
vi.mock('./quickJoin/QuickJoinPanel', () => ({ default: () => null }));
vi.mock('routes/game/create/CreateGame', () => ({ default: () => null }));

beforeEach(() => {
  document.cookie = 'unifiedGamePanelExpanded=false';
  state.rustCounters = 1;
  state.isSupporter = false;
});
afterEach(cleanup);

it('keeps the rewarded button mounted while game setup is collapsed', () => {
  render(<UnifiedGamePanel />);
  const button = screen.getByRole('button', { name: 'Watch Ad to Clear' });
  expect(button).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /expand/i }));
  expect(screen.getByRole('button', { name: 'Watch Ad to Clear' })).toBe(button);
});

it('does not expose a rewarded button to a supporter in the collapsed panel', () => {
  state.isSupporter = true;
  render(<UnifiedGamePanel />);
  expect(screen.queryByRole('button', { name: 'Watch Ad to Clear' })).toBeNull();
});
