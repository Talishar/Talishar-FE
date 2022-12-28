import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../app/Store';
import { createRoot } from 'react-dom/client';
import ChainLinkSummaryContainer from './ChainLinkSummary';
import { renderWithProviders } from '../../../utils/TestUtils';
import { OfflineTestingGameState } from '../../../features/game/InitialGameState';
import {
  setGameStart,
  showChainLinkSummary
} from '../../../features/game/GameSlice';
import { prettyDOM, waitForElementToBeRemoved } from '@testing-library/react';

it('renders without crashing isPlayer true', () => {
  const div = renderWithProviders(<ChainLinkSummaryContainer />);
});

it('does something', async () => {
  const testStore = store;
  store.dispatch(showChainLinkSummary());
  store.dispatch(
    setGameStart({ playerID: 1, gameID: 123456, authKey: '12345' })
  );
  console.log('store dispatched I guess');
  const div = renderWithProviders(<ChainLinkSummaryContainer />, {
    store: testStore
  });
  console.log(div.debug());
  await waitForElementToBeRemoved(div.queryByText('Loading...'));
  console.log(div.debug());
});
