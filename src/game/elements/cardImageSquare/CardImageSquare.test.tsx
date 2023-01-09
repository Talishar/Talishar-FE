import React from 'react';
import CardImageSquare from './CardImageSquare';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardImageSquare src={'./cardsquares/WTR001.webp'} />);
});
