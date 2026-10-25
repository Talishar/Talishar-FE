import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppStore } from 'app/Hooks';
import { apiSlice } from 'features/api/apiSlice';
import { restoreGameInfo } from 'features/game/GameSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import { wasAdProviderLoadedInDocument } from 'hooks/useAdScript';
import { IN_GAME_ADS_ENABLED } from 'config/ads';
import { refreshCookieSnapshot } from 'utils/cookieStore';
import {
  FORCED_LAYOUT_FRAME_NAME,
  FramedLayout,
  forcedFrameSize,
  frameZoomWorks,
  isForcedFrameMessage,
  isForcedLayoutFrame,
  postForcedFrameMessage,
  useForcedLayout,
  useForcedLayoutFrame,
  writeForcedFrameBoot
} from './forcedLayout';
import styles from './ForcedLayoutFrame.module.css';

function ForcedLayoutFrame({ layout }: { layout: FramedLayout }) {
  const needsCleanDocument = useRef(
    !IN_GAME_ADS_ENABLED && wasAdProviderLoadedInDocument()
  );
  useLayoutEffect(() => {
    if (needsCleanDocument.current) {
      window.location.reload();
    }
  }, []);

  const { t } = useTranslation();
  usePageTitle(t('PAGES.GAME_PLAY'));

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const store = useAppStore();
  const location = useLocation();
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const faviconObserver = useRef<MutationObserver | null>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(
    null
  );
  const [zoom, setZoom] = useState<boolean | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) =>
        prev && prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    frameZoomWorks().then((works) => {
      if (active) setZoom(works);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const outerFavicon = document.getElementById('favicon');
    const initialHref = outerFavicon?.getAttribute('href') ?? null;
    return () => {
      faviconObserver.current?.disconnect();
      if (outerFavicon && initialHref !== null)
        outerFavicon.setAttribute('href', initialHref);
    };
  }, []);

  useEffect(
    () => () => {
      faviconObserver.current?.disconnect();
      faviconObserver.current = null;
    },
    [location.key]
  );

  const onFrameLoad = () => {
    frameRef.current?.contentWindow?.focus();
    faviconObserver.current?.disconnect();
    faviconObserver.current = null;
    const innerFavicon =
      frameRef.current?.contentDocument?.getElementById('favicon');
    const outerFavicon = document.getElementById('favicon');
    if (!innerFavicon || !outerFavicon) return;
    const copyFavicon = () => {
      const href = innerFavicon.getAttribute('href');
      if (href !== null) outerFavicon.setAttribute('href', href);
    };
    copyFavicon();
    const observer = new MutationObserver(copyFavicon);
    observer.observe(innerFavicon, {
      attributes: true,
      attributeFilter: ['href']
    });
    faviconObserver.current = observer;
  };

  const onHostMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === frameRef.current) return;
    event.preventDefault();
    frameRef.current?.contentWindow?.focus();
  };

  useLayoutEffect(
    () =>
      writeForcedFrameBoot({
        gameInfo: store.getState().game.gameInfo,
        state: location.state ?? null
      }),
    [location.key]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isForcedFrameMessage(event.data)) return;
      dispatch(restoreGameInfo(event.data.gameInfo));
      if (event.data.kind === 'navigate') {
        dispatch(
          apiSlice.util.invalidateTags([{ type: 'UserProfile', id: 'LIST' }])
        );
        navigate(event.data.to, { state: event.data.state });
      } else {
        refreshCookieSnapshot();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [dispatch, navigate]);

  if (needsCleanDocument.current) {
    return null;
  }

  const src = location.pathname + location.search;
  const size = box ? forcedFrameSize(layout, box.width, box.height) : null;

  return (
    <div ref={hostRef} className={styles.host} onMouseDown={onHostMouseDown}>
      {size && zoom !== null && (
        <div
          className={styles.stage}
          style={{
            width: size.width * size.scale,
            height: size.height * size.scale
          }}
        >
          <iframe
            key={location.key}
            ref={frameRef}
            name={FORCED_LAYOUT_FRAME_NAME}
            title={t('PAGES.GAME_PLAY')}
            src={src}
            allow="fullscreen 'none'"
            className={styles.frame}
            style={
              zoom
                ? { width: size.width, height: size.height, zoom: size.scale }
                : {
                    width: size.width,
                    height: size.height,
                    transform: `scale(${size.scale})`
                  }
            }
            onLoad={onFrameLoad}
          />
        </div>
      )}
    </div>
  );
}

export function ForcedLayoutGate({ children }: { children: JSX.Element }) {
  const layout = useForcedLayoutFrame();
  return layout ? <ForcedLayoutFrame layout={layout} /> : children;
}

export function ForcedLayoutFrameBridge({
  children
}: {
  children: JSX.Element;
}) {
  const location = useLocation();
  const store = useAppStore();
  const forced = useForcedLayout();
  const initialPath = useRef(location.pathname);
  const lastForced = useRef(forced);

  const leftPlay =
    isForcedLayoutFrame() &&
    !(
      location.pathname === initialPath.current &&
      initialPath.current.startsWith('/game/play')
    );

  useEffect(() => {
    if (!leftPlay) return;
    postForcedFrameMessage({
      kind: 'navigate',
      to: location.pathname + location.search,
      state: location.state ?? null,
      gameInfo: store.getState().game.gameInfo
    });
  }, [leftPlay, location, store]);

  useEffect(() => {
    if (!isForcedLayoutFrame() || forced === lastForced.current) return;
    lastForced.current = forced;
    postForcedFrameMessage({
      kind: 'layout',
      gameInfo: store.getState().game.gameInfo
    });
  }, [forced, store]);

  return leftPlay ? null : children;
}
