import React from 'react';
import CardTextLink from './CardTextLink';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(
    <CardTextLink cardID="WTR001" cardName="Heart of Fyendal" />
  );
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <span
        class="_cardText_1b6faf"
      >
        Heart of Fyendal
      </span>
    </div>
  `);
});
