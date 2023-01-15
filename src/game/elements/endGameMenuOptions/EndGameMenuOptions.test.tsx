import EndGameMenuOptions from './EndGameMenuOptions';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  const div = renderWithProviders(<EndGameMenuOptions />);
});
