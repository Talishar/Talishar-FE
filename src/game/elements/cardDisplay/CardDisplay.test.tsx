import React from 'react';
import CardDisplay from './CardDisplay';
import { renderWithProviders } from '../../../utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardDisplay />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot('<div />');
});

it('renders a card', () => {
  renderWithProviders(<CardDisplay card={{ cardNumber: 'WTR001' }} />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <div
        class="_card_75f994 _normalSize_75f994"
      >
        <img
          class="_img_75f994"
          src="./cardsquares/WTR001.webp"
        />
        <div
          class="_floatTint_75f994"
        />
        <div
          class="_floatTint_75f994"
        />
        <div
          class="_floatCover_591427"
        />
      </div>
    </div>
  `);
});
