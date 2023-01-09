import React from 'react';
import CardPopUp, { CardImage } from './CardImage';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardImage src={'./cardimages/WTR001.webp'} />);
});
