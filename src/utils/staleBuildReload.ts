import type { createBrowserRouter } from 'react-router-dom';

type Router = ReturnType<typeof createBrowserRouter>;

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const RELOADED_FOR_KEY = 'talishar.staleBuildReloadedFor';

let latestBuildId: string | null = null;

const isStale = () => latestBuildId !== null && latestBuildId !== __BUILD_ID__;

const checkForNewBuild = async () => {
  if (isStale() || document.visibilityState !== 'visible') return;
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!response.ok) return;
    const data = await response.json();
    if (typeof data?.buildId === 'string') latestBuildId = data.buildId;
  } catch {
    // Offline or blocked: try again on the next check.
  }
};

const reloadIntoNewBuild = (): boolean => {
  try {
    if (window.sessionStorage.getItem(RELOADED_FOR_KEY) === latestBuildId) {
      return false;
    }
    window.sessionStorage.setItem(RELOADED_FOR_KEY, latestBuildId ?? '');
  } catch {
    return false;
  }
  window.location.reload();
  return true;
};

export const installStaleBuildReload = (router: Router) => {
  if (import.meta.env.DEV) return;

  let lastPathname = router.state.location.pathname;
  router.subscribe((state) => {
    if (state.navigation.state !== 'idle') return;
    const { pathname } = state.location;
    if (pathname === lastPathname) return;
    lastPathname = pathname;
    if (isStale()) reloadIntoNewBuild();
  });

  document.addEventListener('visibilitychange', checkForNewBuild);
  window.setInterval(checkForNewBuild, CHECK_INTERVAL_MS);
};
