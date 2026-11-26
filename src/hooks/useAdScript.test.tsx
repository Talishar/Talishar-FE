import { renderHook, waitFor } from '@testing-library/react';
import { ADS_ENABLED } from 'config/ads';
import { installFloatingVideoAdGuard } from 'utils/videoAds';
import useAdScript, { installAdInsertionGuard } from './useAdScript';

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

  it('removes a provider element that is identified after insertion', async () => {
    const { unmount } = renderHook(() => useAdScript(false));
    const lateProviderElement = document.createElement('div');
    document.body.appendChild(lateProviderElement);

    // Providers commonly insert a generic wrapper, then identify it as an ad
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(document.body.contains(lateProviderElement)).toBe(true);

    lateProviderElement.id = 'reviq-late-player';

    await waitFor(() => {
      expect(document.body.contains(lateProviderElement)).toBe(false);
    });
    unmount();
  });
});

describe('floating video ad guard', () => {
  it('blocks video ad resources before insertion even without a page ad hook', () => {
    installAdInsertionGuard();
    const videoTag = document.createElement('script');
    videoTag.src = 'https://ads.example.test/player.js?AV_TAGID=123';
    const videoFrame = document.createElement('iframe');
    videoFrame.src = 'https://player.aniview.com/embed';
    const anotherVideoTag = document.createElement('script');
    anotherVideoTag.src = 'https://static.primis.tech/player.js';
    const provider = document.createElement('script');
    provider.src = 'https://js.rev.iq/talishar.net';

    document.head.appendChild(videoTag);
    document.body.insertBefore(videoFrame, null);
    document.head.append(anotherVideoTag, provider);

    try {
      expect(videoTag).not.toBeInTheDocument();
      expect(videoFrame).not.toBeInTheDocument();
      expect(anotherVideoTag).not.toBeInTheDocument();
      expect(provider).toBeInTheDocument();
    } finally {
      provider.remove();
    }
  });

  it('removes existing and late floating players without removing other video', async () => {
    const existingPlayer = document.createElement('div');
    existingPlayer.id = 'reviq-player';
    const regularVideo = document.createElement('video');
    document.body.append(existingPlayer, regularVideo);
    const stopGuard = installFloatingVideoAdGuard();
    const latePlayer = document.createElement('div');

    try {
      expect(existingPlayer).not.toBeInTheDocument();
      document.body.appendChild(latePlayer);
      await waitFor(() => expect(latePlayer).toBeInTheDocument());
      latePlayer.className = 'primis-player';
      await waitFor(() => expect(latePlayer).not.toBeInTheDocument());
      expect(regularVideo).toBeInTheDocument();
    } finally {
      stopGuard();
      existingPlayer.remove();
      latePlayer.remove();
      regularVideo.remove();
    }
  });
});
