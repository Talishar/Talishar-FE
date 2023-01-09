import React from 'react';
import CardPopUp from './CardImage';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardPopUp />);
});
