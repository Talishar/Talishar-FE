import { skipToken } from '@reduxjs/toolkit/query';
import { lazy, useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from 'app/Hooks';
import { apiSlice } from 'features/api/apiSlice';
import { selectCurrentUser } from 'features/auth/authSlice';

function lazyTab(load: () => Promise<{ default: ComponentType }>) {
  let request: ReturnType<typeof load> | undefined;
  const loadOnce = () => {
    request ??= load().catch((error) => {
      request = undefined;
      throw error;
    });
    return request;
  };

  return {
    Page: lazy(loadOnce),
    preload: () => void loadOnce().catch(() => undefined)
  };
}

export const playTab = lazyTab(() => import('./index/Index'));
export const replaysTab = lazyTab(() => import('./game/load/LoadReplay'));
export const matchHistoryTab = lazyTab(() => import('./matchHistory/MatchHistory'));
export const masteryTab = lazyTab(() => import('./mastery/Mastery'));
export const learnTab = lazyTab(() => import('./learn/Learn'));
export const aboutTab = lazyTab(() => import('./about/About'));

const PreloadTabs = () => {
  const [ready, setReady] = useState(false);
  const accountId = useAppSelector(selectCurrentUser);
  const preloadAccountTabs = ready && !!accountId;

  // Wait for the entry tab to render before competing for network and CPU time.
  useEffect(() => {
    const preload = () => {
      playTab.preload();
      learnTab.preload();
      aboutTab.preload();
      setReady(true);
    };

    if (window.requestIdleCallback) {
      const callback = window.requestIdleCallback(preload, { timeout: 1000 });
      return () => window.cancelIdleCallback(callback);
    }

    const timeout = window.setTimeout(preload, 150);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!preloadAccountTabs) return;
    replaysTab.preload();
    matchHistoryTab.preload();
    masteryTab.preload();
  }, [preloadAccountTabs]);

  // Leave the lightweight subscriptions active across tab changes so RTK Query
  // can reuse the responses and apply its normal mutation invalidation rules.
  const account = preloadAccountTabs ? String(accountId) : skipToken;
  apiSlice.endpoints.getSavedReplays.useQuerySubscription(account);
  apiSlice.endpoints.getRecentGames.useQuerySubscription(account);
  apiSlice.endpoints.getMatchHistory.useQuerySubscription(account);
  apiSlice.endpoints.getHeroMastery.useQuerySubscription(
    account === skipToken ? skipToken : { accountId: account }
  );
  apiSlice.endpoints.getMetafyGuides.useQuerySubscription(ready ? 1 : skipToken);

  return null;
};

export const NavigationTabs = () => (
  <>
    <Outlet />
    <PreloadTabs />
  </>
);
