import React from 'react';
import { renderWithProviders } from 'utils/TestUtils';
import CreateGameAPI from './CreateGame';

it('renders without crashing', () => {
  renderWithProviders(<CreateGame />);
});
