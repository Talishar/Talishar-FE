import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from 'utils/TestUtils';
import CreateGame from './CreateGame';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

it('renders without crashing', () => {
  renderWithProviders(<CreateGame />);
});

it('lets you create a game', async () => {
  const user = userEvent.setup();
  renderWithProviders(<CreateGame />);
  const deckLink = document.querySelector('#fabdb');
  if (deckLink) await user.click(deckLink);
  if (deckLink) await user.keyboard('https://fabdb.net/decks/build/YxEebWqz');

  const deckTestButton = document.querySelector('#deckTestMode');
  if (deckTestButton) await user.click(deckTestButton);

  // assert button is single player
  expect(deckTestButton).toMatchInlineSnapshot(`
    <input
      aria-label="Single Player"
      id="deckTestMode"
      name="deckTestMode"
      role="switch"
      type="checkbox"
    />
  `);

  const submitButton = await screen.findByRole('button');
  if (submitButton) await user.click(submitButton);

  // TODO: Mock what is supposed to happen next.
});
