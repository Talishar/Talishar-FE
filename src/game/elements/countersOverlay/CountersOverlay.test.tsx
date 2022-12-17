import React from 'react';
import CountersOverlay from './CountersOverlay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CountersOverlay cardNumber="WTR001" />);
});

it('dislpays a number', () => {
  renderWithProviders(<CountersOverlay cardNumber="WTR001" num={3} />);
  const div = document.querySelector('div');
  expect(div).toContain('3');
}); //might fail.