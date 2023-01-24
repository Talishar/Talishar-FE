import React from 'react';
import Play from './Play';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<Play />);
});
