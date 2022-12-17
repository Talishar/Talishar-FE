import React from 'react';
import CountersOverlay from './CountersOverlay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CountersOverlay cardNumber="WTR001" />);
});
