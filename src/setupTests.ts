// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { apiSlice } from './features/api/apiSlice';
import { setupStore } from './app/Store';

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
  })
];

const server = setupServer(...restHandlers);

// Establish API mocking before all tests.
beforeAll(() => {
  console.log('starting server');
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