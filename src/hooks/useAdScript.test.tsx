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

describe('video ad hit-area containment', () => {
  afterEach(() => {
    document.body.querySelectorAll(':scope > :not(#root)').forEach((element) => {
      element.remove();
    });
  });

  it('keeps transparent provider wrappers click-through', () => {
    const wrapper = document.createElement('div');
    const providerContainer = document.createElement('div');
    const iframe = document.createElement('iframe');
    const transparentCover = document.createElement('div');

    providerContainer.id = 'reviq-player';
    providerContainer.append(iframe, transparentCover);
    wrapper.appendChild(providerContainer);
    document.body.appendChild(wrapper);

    (window as any)._talishar_lockOverlays();

    expect(wrapper.style.getPropertyValue('pointer-events')).toBe('none');
    expect(providerContainer.style.getPropertyValue('pointer-events')).toBe(
      'none'
    );
    expect(transparentCover.style.getPropertyValue('pointer-events')).toBe(
      'none'
    );
    expect(iframe.style.getPropertyValue('pointer-events')).toBe('auto');
  });
});
