import React from 'react';
import { vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { setupStore } from './Store';
import GameStateHandler from './GameStateHandler';
import { loadGameAuthKey, loadGamePlayerID } from 'utils/LocalKeyManagement';
import { saveSnapshotInviteSeat } from 'utils/snapshotInviteSeat';

vi.mock('hooks/useAuth', () => ({
  default: () => ({ isLoggedIn: true, isLoading: false })
}));

vi.mock('utils/LocalKeyManagement', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('utils/LocalKeyManagement')
  >();
  return {
    ...actual,
    loadGameAuthKey: vi.fn(),
    loadGamePlayerID: vi.fn()
  };
});

describe('GameStateHandler seat restoration', () => {
  beforeEach(() => sessionStorage.clear());

  it('restores the saved player seat instead of using the spectator URL default', async () => {
    vi.mocked(loadGameAuthKey).mockReturnValue('saved-player-key');
    vi.mocked(loadGamePlayerID).mockReturnValue(2);
    const store = setupStore();

    const view = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/game/play/12345']}>
          <Routes>
            <Route path="/game/play/:gameID" element={<GameStateHandler />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(store.getState().game.gameInfo).toEqual(
        expect.objectContaining({
          gameID: 12345,
          playerID: 2,
          authKey: 'saved-player-key'
        })
      );
    });

    view.unmount();
  });

  it('uses the invited seat when shared storage contains the owner seat', async () => {
    vi.mocked(loadGameAuthKey).mockReturnValue('owner-key');
    vi.mocked(loadGamePlayerID).mockReturnValue(1);
    const invitedKey = 'b'.repeat(64);
    saveSnapshotInviteSeat(12346, { playerID: 2, authKey: invitedKey });
    const store = setupStore();

    const view = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/game/play/12346']}>
          <Routes>
            <Route path="/game/play/:gameID" element={<GameStateHandler />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(store.getState().game.gameInfo).toEqual(
        expect.objectContaining({
          gameID: 12346,
          playerID: 2,
          authKey: invitedKey
        })
      );
    });

    view.unmount();
  });
});
