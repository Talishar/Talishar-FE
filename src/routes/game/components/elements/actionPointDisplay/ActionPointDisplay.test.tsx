import React from 'react';
import ActionPointDisplay from './ActionPointDisplay';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing isPlayer true', () => {
  renderWithProviders(<ActionPointDisplay isPlayer />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <div
        class="_actionPointDisplay_f2afca"
      >
        <div
          class="_actionPointCounter_f2afca"
        >
          0 AP
        </div>
      </div>
    </div>
  `);
});
