import { store } from 'app/Store';
import EndGameScreen from './EndGameScreen';
import { renderWithProviders } from 'utils/TestUtils';
import { setGameStart, showChainLinkSummary } from 'features/game/GameSlice';

it('renders without crashing isPlayer true', () => {
  const div = renderWithProviders(<EndGameScreen />);
});

it('does something', async () => {
  const testStore = store;
  store.dispatch(showChainLinkSummary({ chainLink: 0 }));
  store.dispatch(
    setGameStart({ playerID: 1, gameID: 123456, authKey: '12345' })
  );
  const div = renderWithProviders(<EndGameScreen />, {
    store: testStore
  });
  await div.findByText('Card Play Stats');
});
