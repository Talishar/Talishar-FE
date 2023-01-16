import React from 'react';
import CardPopUp from './CardPopUp';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardPopUp />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot('<div />');
});
