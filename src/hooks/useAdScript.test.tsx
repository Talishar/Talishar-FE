import { renderHook } from '@testing-library/react';
import { ADS_ENABLED } from 'config/ads';
import useAdScript from './useAdScript';

describe('ad provider security kill switch', () => {
  afterEach(() => {
    document
      .querySelectorAll('script[src*="rev.iq"]')
      .forEach((element) => element.remove());
  });

  it('is disabled by default', () => {
    expect(ADS_ENABLED).toBe(false);
  });

  it('removes an existing provider script instead of loading it', () => {
    const script = document.createElement('script');
    script.src = 'https://js.rev.iq/talishar.net';
    document.head.appendChild(script);

    const { unmount } = renderHook(() => useAdScript(true));

    expect(document.querySelector('script[src*="rev.iq"]')).toBeNull();
    unmount();
  });
});
