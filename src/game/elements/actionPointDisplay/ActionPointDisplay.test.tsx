import React from 'react';
import ActionPointDisplay from './ActionPointDisplay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing isPlayer true', () => {
  renderWithProviders(<ActionPointDisplay isPlayer />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <div
        class="_actionPointDisplay_46ece5"
      >
        <div
          class="_actionPointCounter_46ece5"
        >
          0
        </div>
      </div>
    </div>
  `);
});
