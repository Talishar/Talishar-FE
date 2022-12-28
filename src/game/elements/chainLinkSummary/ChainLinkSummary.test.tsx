import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../app/Store';
import { createRoot } from 'react-dom/client';
import ChainLinkSummary from './ChainLinkSummary';
import { renderWithProviders } from '../../../utils/TestUtils';
import { OfflineTestingGameState } from '../../../features/game/InitialGameState';

it('renders without crashing isPlayer true', () => {
  const div = renderWithProviders(<ChainLinkSummary />);
});

it('does something', () => {
  const div = renderWithProviders(<ChainLinkSummary />);
  console.log(div);
  expect(true).toEqual(true);
});
