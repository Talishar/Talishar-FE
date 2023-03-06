import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import OptionsMenu from './OptionsMenu';
import { renderWithProviders } from 'utils/TestUtils';
import { OfflineTestingGameState } from 'features/game/InitialGameState';
import { screen, act, waitFor } from '@testing-library/react';
import GameState from 'features/GameState';

const renderWithOptionsOpen = () =>
  renderWithProviders(<OptionsMenu />, {
    preloadedState: {
      game: { ...OfflineTestingGameState, optionsMenu: { active: true } },
      auth: { user: null, userName: null, token: null }
    }
  });

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <OptionsMenu />
    </Provider>
  );
});

it('you can click a button', async () => {
  renderWithOptionsOpen();
  const button = await screen.findByText("Submit Options (jk I don't work)");

  act(() => {
    button.click();
  });

  expect(button).toMatchSnapshot();
});

it('closes the window when you click the close button', async () => {
  act(() => renderWithOptionsOpen());

  const closeButton = await screen.findByTestId('close-button');
  act(() => {
    closeButton.click();
  });
  await waitFor(() => expect(closeButton).not.toBeInTheDocument());
});
