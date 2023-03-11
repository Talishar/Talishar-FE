import React from 'react';
import { Provider } from 'react-redux';
import { globalInitialState, store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import CurrentAttack from './CurrentAttack';
import { vi } from 'vitest';
import { screen, act, fireEvent } from '@testing-library/react';
import { OfflineTestingGameState } from 'features/game/InitialGameState';
import { renderWithProviders } from 'utils/TestUtils';
import { useDispatch } from 'react-redux';
import { defaultAuth } from 'features/auth/constants';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <CurrentAttack />
    </Provider>
  );
});

const redux = { useDispatch };

// only loading
it('will show the current attack with attack and defence values', async () => {
  renderWithProviders(<CurrentAttack />, {
    preloadedState: {
      ...globalInitialState,
      game: OfflineTestingGameState
    }
  });

  const attackValue = await screen.findByTestId('attack-value');
  expect(attackValue).toMatchInlineSnapshot(`
    <div
      class="_attDiv_c76636"
      data-testid="attack-value"
    >
      88
    </div>
  `);

  const defenceValue = await screen.findByTestId('defence-value');
  expect(defenceValue).toMatchInlineSnapshot(`
    <div
      class="_defDiv_c76636"
      data-testid="defence-value"
    >
      44
    </div>
  `);
});

// TODO: learn how to do mocks properly
it.skip('will try to open attack window when clicking attack img', async () => {
  renderWithProviders(<CurrentAttack />, {
    preloadedState: {
      ...globalInitialState,
      game: OfflineTestingGameState
    }
  });
  const attackZoneDisplay = vi.spyOn(redux, 'useDispatch');

  const attackSymbol = await screen.findByAltText('attack symbol');

  act(() => {
    attackSymbol.click();
  });

  expect(attackZoneDisplay).toBeCalled();
});
