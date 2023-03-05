import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { screen } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import PlayerInputPopUp from './PlayerInputPopUp';
import { renderWithProviders } from 'utils/TestUtils';
import { OfflineTestingGameState } from 'features/game/InitialGameState';

it('renders without crashin', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <PlayerInputPopUp />
    </Provider>
  );
});

it('renders two cards onto the screen', async () => {
  const initialState = {
    game: {
      ...OfflineTestingGameState,
      playerInputPopUp: {
        active: true,
        title: 'Test Title',
        canClose: true,
        popup: {
          cards: [
            {
              cardNumber: 'WTR001'
            },
            { cardNumber: 'UPR001' }
          ]
        }
      }
    }
  };
  renderWithProviders(<PlayerInputPopUp />, { preloadedState: initialState });
  expect(screen.getAllByRole('img')).toHaveLength(2);
});
