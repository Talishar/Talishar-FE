import React from 'react';
import { renderWithProviders } from 'utils/TestUtils';
import GameList from './GameList';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { apiSlice } from 'features/api/apiSlice';

it('displays loading! when loading', () => {
  const { container } = renderWithProviders(<GameList />);
  expect(container).toMatchSnapshot();
});

// TODO: Rewrite the test so it works properly
it.skip('displays the list of games! when loaded', async () => {
  const div = renderWithProviders(<GameList />);
  const list = await div.findByTestId('games-in-progress');
  expect(list).toMatchSnapshot();
});
