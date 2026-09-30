import { isAdFreeRoute, isVideoAdRoute } from './ads';

describe('ad-free routes', () => {
  it.each([
    '/play',
    '/play/12345',
    '/game/play',
    '/game/play/',
    '/game/play/12345'
  ])('blocks the ad provider on %s', (pathname) => {
    expect(isAdFreeRoute(pathname)).toBe(true);
  });

  it.each(['/', '/about', '/learn', '/game/join/12345', '/game/lobby/12345'])(
    'allows the configured ad provider on %s',
    (pathname) => {
      expect(isAdFreeRoute(pathname)).toBe(false);
    }
  );
});

describe('video ad route', () => {
  it.each(['/ads-test', '/ads-test/'])('allows %s', (pathname) => {
    expect(isVideoAdRoute(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/about',
    '/learn',
    '/game/join/12345',
    '/game/lobby/12345',
    '/game/play',
    '/game/play/12345',
    '/ads-test/other'
  ])('blocks %s', (pathname) => {
    expect(isVideoAdRoute(pathname)).toBe(false);
  });
});
