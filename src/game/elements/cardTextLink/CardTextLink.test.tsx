import React from 'react';
import CardTextLink from './CardTextLink';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(
    <CardTextLink cardID="WTR001" cardName="Heart of Fyendal" />
  );
});
