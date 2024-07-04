import React from 'react';
import CardDisplay from './CardDisplay';
import { renderWithProviders } from 'utils/TestUtils';

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
        class="_card_877d58 _normalSize_877d58"
      >
        <img
          class="_img_877d58"
          src="/cardsquares/English/WTR001.webp"
        />
        <div
          class="_countersCover_562030"
        />
      </div>
    </div>
  `);
});
