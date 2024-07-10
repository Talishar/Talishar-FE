import React from 'react';
import CardPopUp, { CardImage } from './CardImage';
import { renderWithProviders } from 'utils/TestUtils';

it('renders without crashing', () => {
  renderWithProviders(<CardImage src={'/cardimages/English/WTR001.webp'} />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <img
        src="/cardimages/English/WTR001.webp"
      />
    </div>
  `);
});
