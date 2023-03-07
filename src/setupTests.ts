// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { apiSlice } from './features/api/apiSlice';
import { setupStore } from './app/Store';
import { vi } from 'vitest';
import mockOptionsMenuResponse from 'mocks/optionsmenu/mockOptionsMenuResponse';

const store = setupStore();

export const restHandlers = [
  rest.get('api/live/GetPopupAPI.php', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        Cards: [
          { Player: '2', Name: 'Zipper Hit', cardID: 'ARC030', modifier: '4' }
        ]
      })
    );
  }),
  rest.get('api/dev/GetPopupAPI.php', (req, res, ctx) => {
    switch (req.url.searchParams.get('popupType')) {
      case 'mySettings':
        return res(ctx.status(200), ctx.json(mockOptionsMenuResponse));

      default:
        return res(
          ctx.status(200),
          ctx.json({
            Cards: [
              {
                Player: '2',
                Name: 'Zipper Hit',
                cardID: 'ARC030',
                modifier: '4'
              }
            ]
          })
        );
    }
  }),
  rest.post('/api/dev/APIs/CreateGame.php', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        gameName: 870609,
        playerID: 1,
        authKey:
          '75391d54a09cdfe877cfe9fc641dfab449e7d4ef37a1536e27cae2c0596c78d9'
      })
    );
  }),
  rest.get(
    'http://127.0.0.1:5173/api/live/APIs/GetGameList.php',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          gamesInProgress: [
            {
              p1Hero: 'ELE062',
              p2Hero: 'UPR044',
              secondsSinceLastUpdate: 0,
              gameName: '613615'
            },
            {
              p1Hero: 'UPR102',
              p2Hero: 'UPR044',
              secondsSinceLastUpdate: 9,
              gameName: '613650'
            },
            {
              p1Hero: 'WTR001',
              p2Hero: 'UPR001',
              secondsSinceLastUpdate: 6,
              gameName: '613611'
            }
          ],
          openGames: [
            {
              p1Hero: 'MON002',
              format: 'blitz',
              formatName: '',
              description: 'Game #613659',
              gameName: '613659'
            },
            {
              p1Hero: 'EVR120',
              format: 'commoner',
              formatName: 'Commoner ',
              description: 'Game #613569',
              gameName: '613569'
            },
            {
              p1Hero: 'WTR002',
              format: 'blitz',
              formatName: '',
              description: 'Game #613664',
              gameName: '613664'
            }
          ],
          canSeeQueue: false
        })
      );
    }
  )
];

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

const server = setupServer(...restHandlers);

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error'
  });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  // This is the solution to clear RTK Query cache after each test
  store.dispatch(apiSlice.util.resetApiState());
});

// Clean up after the tests are finished.
afterAll(() => server.close());
