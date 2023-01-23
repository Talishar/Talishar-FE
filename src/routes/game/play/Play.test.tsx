import React from 'react';
import Play from './play';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<Play />);
});
