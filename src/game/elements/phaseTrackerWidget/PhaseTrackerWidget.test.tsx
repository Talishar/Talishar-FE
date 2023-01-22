import React from 'react';
import { renderWithProviders } from '../../../utils/TestUtils';
import PhaseTrackerWidget from './PhaseTrackerWidget';

it('matches snapshot main phase', () => {
  const div = renderWithProviders(<PhaseTrackerWidget phase={'M'} />);
  const display = document.querySelector('div');
  expect(display).toMatchSnapshot();
});

it('matches snapshot defence reaction phase', () => {
  const div = renderWithProviders(<PhaseTrackerWidget phase={'D'} />);

  const display = document.querySelector('div');
  expect(display).toMatchSnapshot();
});
