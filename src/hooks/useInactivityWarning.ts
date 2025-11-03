import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  updateActionTimestamp,
  setFirstWarningShown,
  setSecondWarningShown,
  resetInactivityTimer,
  submitInactivityMessage
} from 'features/game/GameSlice';

export enum InactivityWarningLevel {
  NONE = 'none',
  FIRST_WARNING = 'first', // 45 seconds
  SECOND_WARNING = 'second', // 60 seconds
  OPPONENT_INACTIVE = 'opponent_inactive' // 15 seconds after second warning
}

export interface InactivityWarningState {
  level: InactivityWarningLevel;
  secondsInactive: number;
  secondsUntilOpponentInactivePrompt?: number; // Countdown to opponent inactive prompt (15s after second warning)
}

/**
 * Hook that tracks player inactivity and manages warning levels.
 * 
 * Shows a warning at:
 * - 30 seconds: First warning
 * - 60 seconds: Second warning
 * 
 * Only active for the player who currently has priority.
 * 
 * @returns {InactivityWarningState} Current inactivity state with level and seconds inactive
 */
export const useInactivityWarning = (): InactivityWarningState => {
  const dispatch = useAppDispatch();
  const inactivityWarning = useAppSelector(
    (state: RootState) => state.game.inactivityWarning
  );
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const hasPriority = useAppSelector((state: RootState) => state.game.hasPriority);

  // State to force re-renders when timer ticks
  const [, setTick] = useState(0);
  const hasResetForGameStart = useRef(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when game actually starts (when we enter Play phase with a turnPhase)
  useEffect(() => {
    if (turnPhase && !hasResetForGameStart.current) {
      hasResetForGameStart.current = true;
      // Game has started - reset the inactivity timer to now
      dispatch(resetInactivityTimer());
    }
  }, [turnPhase, dispatch]);

  // Calculate current inactivity level
  const getInactivityLevel = (lastActionTime: number, secondWarningStartTime?: number): InactivityWarningState => {
    const now = Date.now();
    const secondsInactive = Math.floor((now - lastActionTime) / 1000);

    // Check if we're in opponent inactive state (15+ seconds after second warning)
    if (secondWarningStartTime) {
      const secondsSinceWarning = Math.floor((now - secondWarningStartTime) / 1000);
      if (secondsSinceWarning >= 15) {
        return {
          level: InactivityWarningLevel.OPPONENT_INACTIVE,
          secondsInactive,
          secondsUntilOpponentInactivePrompt: 0
        };
      }
      // Still in the 15-second window
      if (secondsInactive >= 60) {
        return {
          level: InactivityWarningLevel.SECOND_WARNING,
          secondsInactive,
          secondsUntilOpponentInactivePrompt: 15 - secondsSinceWarning
        };
      }
    }

    if (secondsInactive >= 60) {
      return {
        level: InactivityWarningLevel.SECOND_WARNING,
        secondsInactive,
        secondsUntilOpponentInactivePrompt: undefined
      };
    } else if (secondsInactive >= 45) {
      return {
        level: InactivityWarningLevel.FIRST_WARNING,
        secondsInactive
      };
    }

    return {
      level: InactivityWarningLevel.NONE,
      secondsInactive
    };
  };

  // Effect: Set up interval to check inactivity, trigger warnings, and force re-renders
  useEffect(() => {
    if (!inactivityWarning || !turnPhase || gameInfo.playerID === 3 || !hasPriority) {
      // Don't track inactivity for spectators, without priority, or if no game state
      return;
    }

    // Check inactivity every second
    intervalRef.current = setInterval(() => {
      const state = getInactivityLevel(
        inactivityWarning.lastActionTime,
        inactivityWarning.secondWarningStartTime
      );

      // Trigger warning state updates
      if (
        state.level === InactivityWarningLevel.FIRST_WARNING &&
        !inactivityWarning.firstWarningShown &&
        state.secondsInactive >= 30
      ) {
        dispatch(setFirstWarningShown(true));
      } else if (
        state.level === InactivityWarningLevel.SECOND_WARNING &&
        !inactivityWarning.secondWarningShown &&
        state.secondsInactive >= 60
      ) {
        dispatch(setSecondWarningShown(true));
        // Submit inactivity message to backend to persist in game log
        // The current player has priority and is inactive
        dispatch(submitInactivityMessage({ playerID: gameInfo.playerID, inactivePlayer: gameInfo.playerID }));
      }

      // Force re-render to update the timer display
      setTick((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    inactivityWarning?.lastActionTime,
    inactivityWarning?.firstWarningShown,
    inactivityWarning?.secondWarningShown,
    turnPhase,
    gameInfo.playerID,
    hasPriority,
    dispatch
  ]);

  if (!inactivityWarning) {
    return {
      level: InactivityWarningLevel.NONE,
      secondsInactive: 0
    };
  }

  return getInactivityLevel(
    inactivityWarning.lastActionTime,
    inactivityWarning.secondWarningStartTime
  );
};
