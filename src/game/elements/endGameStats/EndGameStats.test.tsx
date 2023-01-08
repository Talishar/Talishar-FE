import React from 'react';
import { store } from '../../../app/Store';
import EndGameStats from './EndGameStats';
import { renderWithProviders } from '../../../utils/TestUtils';
import {
  setGameStart,
  showChainLinkSummary
} from '../../../features/game/GameSlice';

it('renders without crashing isPlayer true', () => {
  const div = renderWithProviders(<EndGameStats />);
});
