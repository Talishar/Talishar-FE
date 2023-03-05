import { renderWithProviders } from 'utils/TestUtils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

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
it('displays the list of games! when loaded', async () => {
  const div = renderWithProviders(<GameList />);
  const list = await div.findByTestId('games-in-progress');
  expect(list).toMatchSnapshot();
});
