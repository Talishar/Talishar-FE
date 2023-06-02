import { renderWithProviders } from 'utils/TestUtils';

class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = ResizeObserver;

import GameList from './GameList';

it('displays loading! when loading', () => {
  console.log('hello');
  const { container } = renderWithProviders(<GameList />);
  expect(container).toMatchSnapshot();
});

// TODO: Rewrite the test so it works properly
it.skip('displays the list of games! when loaded', async () => {
  const div = renderWithProviders(<GameList />);
  const list = await div.findByTestId('games-in-progress');
  expect(list).toMatchSnapshot();
});
