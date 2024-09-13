import React from 'react';
import { Provider } from 'react-redux';
import { globalInitialState, store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import { renderWithProviders } from 'utils/TestUtils';
import { OfflineTestingGameState } from 'features/game/InitialGameState';
import { screen } from '@testing-library/react';

import PitchZone from './PitchZone';

it('renders without crashing isPlayer true', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <PitchZone isPlayer DisplayRow="" />
    </Provider>
  );
});

it('renders without crashing isPlayer false', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <PitchZone isPlayer={false} DisplayRow="" />
    </Provider>
  );
});

describe('When rendering the pitch zone', () => {
  it('When a user pitches, it should not show more than 4 cards', async () => {
      const initialState = {
        ...globalInitialState,
        game: {
          ...OfflineTestingGameState,
          playerOne: {
            ...OfflineTestingGameState.playerOne,
            Pitch: new Array(5).fill({ cardNumber: 'ARC003' }, 0, 5)
          }
        }
      };

      renderWithProviders(<PitchZone isPlayer DisplayRow="" />, {
        preloadedState: initialState
      });

      expect(screen.getAllByTestId('pitch-motion-div')).toHaveLength(4);
  });
});