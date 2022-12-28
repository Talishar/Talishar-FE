// ./src/mock/api/handler.js

// Build out the mocks for other APIs and stuff for Talishar, this is just an example for one.
import { rest } from 'msw';

export const handlers = [
  rest.get('https://jsonplaceholder.typicode.com/users', (req, res, ctx) => {
    // successful response
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Xabi Alonzo' },
        { id: 2, name: 'Lionel Messi' },
        { id: 3, name: 'Lionel Love' },
        { id: 4, name: 'Lionel Poe' },
        { id: 5, name: 'Lionel Gink' }
      ]),
      ctx.delay(30)
    );
  })
];
