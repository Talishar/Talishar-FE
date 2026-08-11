import { useEffect, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

const DEFAULT_TIMEOUT_MS = 5000;

// We use to have locally or in-game some crash when people pushed too many buttons in a row for settings.
// This was the fix to add a small delay to each clicks
export const usePlayerInputInProgress = (
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): boolean => {
  const inProgress = useAppSelector(
    (state: RootState) => state.game.isPlayerInputInProgress ?? false
  );
  const requestId = useAppSelector(
    (state: RootState) => state.game.playerInputRequestId
  );
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!inProgress) {
      setHasTimedOut(false);
      return;
    }
    setHasTimedOut(false);
    const timer = setTimeout(() => setHasTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [inProgress, requestId, timeoutMs]);

  return inProgress && !hasTimedOut;
};

export default usePlayerInputInProgress;
