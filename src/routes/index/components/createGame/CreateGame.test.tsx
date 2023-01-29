import React from 'react';
import { renderWithProviders } from 'utils/TestUtils';
import CreateGame from './CreateGame';

it('renders without crashing', () => {
  renderWithProviders(<CreateGame />);
});
