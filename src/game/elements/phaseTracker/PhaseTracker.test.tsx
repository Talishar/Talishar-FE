import React from 'react';
import PhaseTracker from './PhaseTracker';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  const div = renderWithProviders(<PhaseTracker />);
  const display = document.querySelector('div');
  expect(display).toMatchSnapshot();
});
