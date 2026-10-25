import React, { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppStore } from 'app/Hooks';
import { apiSlice } from 'features/api/apiSlice';
import { restoreGameInfo } from 'features/game/GameSlice';
import { IN_GAME_ADS_ENABLED } from 'config/ads';
import { wasAdProviderLoadedInDocument } from 'hooks/useAdScript';
import { usePageTitle } from 'hooks/usePageTitle';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { refreshCookieSnapshot } from 'utils/cookieStore';
import {
  FORCED_LAYOUT,
  FORCED_LAYOUT_FRAME_NAME,
  forcedFrameSize,
  frameHost,
  useForcedLayout,
  useForcedLayoutFrame
} from './forcedLayout';
import styles from './ForcedLayoutFrame.module.css';

function ForcedLayoutFrame({ layout }: { layout: number }) {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.GAME_PLAY'));
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, windowHeight] = useWindowDimensions();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    window.forcedLayoutHost = {
      gameInfo: store.getState().game.gameInfo,
      state: location.state,
      sync: (gameInfo, to) => {
        dispatch(restoreGameInfo(structuredClone(gameInfo)));
        if (!to) {
          refreshCookieSnapshot();
          return;
        }
        dispatch(
          apiSlice.util.invalidateTags([{ type: 'UserProfile', id: 'LIST' }])
        );
        navigate(to.path, { state: structuredClone(to.state) });
      }
    };
    return () => {
      delete window.forcedLayoutHost;
    };
  }, [dispatch, navigate, store, location]);

  const focusFrame = () => frameRef.current?.contentWindow?.focus();
  const { width, height, scale } = forcedFrameSize(
    layout,
    windowWidth,
    windowHeight
  );

  return (
    <div
      className={styles.host}
      onMouseDown={(event) => {
        event.preventDefault();
        focusFrame();
      }}
    >
      <iframe
        key={location.key}
        ref={frameRef}
        name={FORCED_LAYOUT_FRAME_NAME}
        title={t('PAGES.GAME_PLAY')}
        src={location.pathname + location.search}
        allow="fullscreen 'none'"
        className={styles.frame}
        style={{ width, height, transform: `scale(${scale})` }}
        onLoad={focusFrame}
      />
    </div>
  );
}

export function ForcedLayoutGate() {
  const needsCleanDocument = useRef(
    !IN_GAME_ADS_ENABLED && wasAdProviderLoadedInDocument()
  );
  useLayoutEffect(() => {
    if (needsCleanDocument.current) {
      window.location.reload();
    }
  }, []);
  const layout = useForcedLayoutFrame();

  if (needsCleanDocument.current) {
    return null;
  }
  return layout === FORCED_LAYOUT.NONE ? (
    <Outlet />
  ) : (
    <ForcedLayoutFrame layout={layout} />
  );
}

export function ForcedLayoutFrameBridge({ children }: { children: ReactNode }) {
  const location = useLocation();
  const store = useAppStore();
  const layout = useForcedLayout();
  const startPath = useRef(location.pathname);
  const syncedLayout = useRef(layout);
  const left = !!frameHost && location.pathname !== startPath.current;

  useEffect(() => {
    if (!frameHost) return;
    const { gameInfo } = store.getState().game;
    if (left) {
      frameHost.sync(gameInfo, {
        path: location.pathname + location.search,
        state: location.state
      });
    } else if (layout !== syncedLayout.current) {
      syncedLayout.current = layout;
      frameHost.sync(gameInfo);
    }
  }, [left, layout, location, store]);

  return left ? null : <>{children}</>;
}
