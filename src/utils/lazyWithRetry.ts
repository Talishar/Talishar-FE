import { ComponentType, lazy } from 'react';

const RELOAD_FLAG = 'talishar_chunk_reloaded';

const isChunkLoadError = (error: unknown): boolean => {
  const message =
    error instanceof Error ? error.message : String(error ?? '');
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    // Safari / older Chrome wording
    /Unable to preload CSS/i.test(message)
  );
};

export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  retries = 2,
  interval = 500
) {
  return lazy(async () => {
    try {
      const module = await importer();
      clearChunkReloadFlag();
      return module;
    } catch (error) {
      for (let attempt = 0; attempt < retries; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        try {
          const module = await importer();
          clearChunkReloadFlag();
          return module;
        } catch {
          // keep retrying
        }
      }

      if (isChunkLoadError(error)) {
        const alreadyReloaded =
          window.sessionStorage.getItem(RELOAD_FLAG) === 'true';
        if (!alreadyReloaded) {
          window.sessionStorage.setItem(RELOAD_FLAG, 'true');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }

      throw error;
    }
  });
}

export function clearChunkReloadFlag(): void {
  try {
    window.sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    // sessionStorage may be unavailable (private mode); ignore.
  }
}
