import React from 'react';
import { store } from 'app/Store';
import ChainLinkSummaryContainer from './ChainLinkSummary';
import { renderWithProviders } from 'utils/TestUtils';
import { setGameStart, showChainLinkSummary } from 'features/game/GameSlice';

it('renders without crashing isPlayer true', () => {
  const div = renderWithProviders(<ChainLinkSummaryContainer />);
  const display = document.querySelector('div');
  expect(display).toMatchSnapshot();
});

it('shows a mock chain link summary', async () => {
  const testStore = store;
  store.dispatch(showChainLinkSummary({ chainLink: 0 }));
  store.dispatch(
    setGameStart({ playerID: 1, gameID: 123456789, authKey: '12345' })
  );
  const div = renderWithProviders(<ChainLinkSummaryContainer />, {
    store: testStore
  });
  await div.findByText('Zipper Hit');
  const display = document.querySelector('div');
  expect(display).toMatchSnapshot();
});
