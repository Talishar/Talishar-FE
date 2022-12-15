import React from 'react';
import CardDisplay from './CardDisplay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardDisplay />);
});

it('deliberate test to fail', () => {
  renderWithProviders(<CardDisplay />);
  expect(true).toEqual(false);
});
