import React from 'react';
import { store } from '../../../app/Store';
import ChainLinkSummaryContainer from './ChainLinkSummary';
import { renderWithProviders } from '../../../utils/TestUtils';
import {
  setGameStart,
  showChainLinkSummary
} from '../../../features/game/GameSlice';

it('renders without crashing isPlayer true', () => {
  const div = renderWithProviders(<ChainLinkSummaryContainer />);
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot('<div />');
});

it('shows a mock chain link summary', async () => {
  const testStore = store;
  store.dispatch(showChainLinkSummary({ chainLink: 0 }));
  store.dispatch(
    setGameStart({ playerID: 1, gameID: 123456, authKey: '12345' })
  );
  const div = renderWithProviders(<ChainLinkSummaryContainer />, {
    store: testStore
  });
  await div.findByText('Zipper Hit');
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot(`
    <div>
      <div>
        <div
          class="_emptyOutside_bb3b61"
        >
          <div
            class="_cardListBox_bb3b61"
          >
            <div
              class="_cardListTitleContainer_bb3b61"
            >
              <div
                class="_cardListTitle_bb3b61"
              >
                <h3
                  class="_title_bb3b61"
                >
                  Chain Link Summary
                </h3>
              </div>
              <div
                class="_cardListCloseIcon_bb3b61"
              >
                <svg
                  fill="currentColor"
                  height="1em"
                  stroke="currentColor"
                  stroke-width="0"
                  viewBox="0 0 352 512"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>
                    close dialog
                  </title>
                  <path
                    d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                  />
                </svg>
              </div>
            </div>
            <div
              class="_cardListContents_bb3b61"
            >
              <table
                class="_table_bb3b61"
              >
                <thead>
                  <tr>
                    <th
                      class="_leftColumn_bb3b61"
                    />
                    <th
                      class="_midColumn_bb3b61"
                    >
                      Card
                    </th>
                    <th
                      class="_rightColumn_bb3b61"
                    >
                      Effect
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      class="_column_bb3b61"
                    >
                      <div
                        class="_effect_7d1df9"
                      >
                        <img
                          class="_img_7d1df9"
                          src="./crops/ARC030_cropped.png"
                        />
                      </div>
                    </td>
                    <td
                      class="_column_bb3b61"
                    >
                      <span
                        class="_cardText_b954fc"
                      >
                        Zipper Hit
                      </span>
                    </td>
                    <td
                      class="_column_bb3b61"
                    >
                      +
                      4
                       attack or def
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
});
