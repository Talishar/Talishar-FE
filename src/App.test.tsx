import React from 'react';
import App from './App';
import { renderWithProviders } from './utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<App />);
});
