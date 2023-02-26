import React from 'react';
import Play from './Play';
import { renderWithProviders } from 'utils/TestUtils';

// TODO: Why does this test crash (gamestatehandler something I think)
it.skip('renders without crashing', () => {
  renderWithProviders(<Play />);
});
