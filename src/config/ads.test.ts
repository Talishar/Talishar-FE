import { isAdFreeRoute } from './ads';

describe('ad-free routes', () => {
  it.each([
    '/play',
    '/play/12345',
    '/game/play',
    '/game/play/',
    '/game/play/12345',
    '/roguelike/play',
    '/roguelike/play/'
  ])('blocks the ad provider on %s', (pathname) => {
    expect(isAdFreeRoute(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/about',
    '/learn',
    '/game/join/12345',
    '/game/lobby/12345'
  ])('allows the configured ad provider on %s', (pathname) => {
    expect(isAdFreeRoute(pathname)).toBe(false);
  });
});
