import React from 'react';
import { renderWithProviders } from 'utils/TestUtils';
import GameList from './GameList';

it('renders without crashing', () => {
  renderWithProviders(<GameList />);
});
