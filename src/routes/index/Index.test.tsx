import React from 'react';
import { renderWithProviders } from 'utils/TestUtils';
import Index from './Index';

it('renders without crashing', () => {
  renderWithProviders(<Index />);
});
