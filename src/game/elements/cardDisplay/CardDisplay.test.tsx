import React from 'react';
import CardDisplay from './CardDisplay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardDisplay />);
});
