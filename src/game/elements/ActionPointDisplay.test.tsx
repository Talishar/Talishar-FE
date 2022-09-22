import React from 'react';
import ActionPointDisplay from './ActionPointDisplay';
import { renderWithProviders } from '../../utils/TestUtils';

it('renders without crashing isPlayer true', () => {
  renderWithProviders(<ActionPointDisplay isPlayer />);
});

it('renders without crashing isPlayer false', () => {
  renderWithProviders(<ActionPointDisplay isPlayer={false} />);
});
