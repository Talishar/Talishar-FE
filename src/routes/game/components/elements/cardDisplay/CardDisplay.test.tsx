import React from 'react';
import CardDisplay from './CardDisplay';
import { renderWithProviders } from 'utils/TestUtils';
import {CLOUD_IMAGES_URL} from "../../../../../appConstants";

it('renders without crashing', () => {
  renderWithProviders(<CardDisplay />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot('<div />');
});

it('renders a card', () => {
  const imgSrc = `${CLOUD_IMAGES_URL}/cardsquares/English/WTR001.webp`;
  renderWithProviders(<CardDisplay card={{ cardNumber: 'WTR001' }} />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <div
        class="_card_877d58 _normalSize_877d58"
      >
        <img
          class="_img_877d58"
          src="https://images.talishar.net/public/cardsquares/english/WTR001.webp"
        />
        <div
          class="_countersCover_562030"
        />
      </div>
    </div>
  `);
});
