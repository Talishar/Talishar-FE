import React from 'react';
import GemSlider from './GemSlider';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<GemSlider />);
});
