import CardPortal from './CardPortal';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardPortal />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot('<div />');
});
