import React from 'react';
import CardTextLink from './CardTextLink';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(
    <CardTextLink cardNumber="WTR001" cardName="Heart of Fyendal" />
  );
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <div
        class="_cardText_1b6faf"
      >
        <span>
          Heart of Fyendal
        </span>
      </div>
    </div>
  `);
});
