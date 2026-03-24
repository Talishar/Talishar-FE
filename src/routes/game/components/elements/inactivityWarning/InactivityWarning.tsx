import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  useInactivityWarning,
  InactivityWarningLevel,
  useOpponentInactivityWarning,
  OpponentInactivityLevel
} from 'hooks/useInactivityWarning';
import { useSendGameChat } from 'hooks/useSendGameChat';
import { stillHereButtonClicked, submitButton, submitInactivityMessage } from 'features/game/GameSlice';
import styles from './InactivityWarning.module.css';

// DEBUG MODE - Set to true to see timer and priority info
const DEBUG_MODE = false;

/**
 * Component that displays inactivity warnings to the current active player.
 * Shows at 45 seconds (yellow warning) and 60 seconds (red critical warning).
 * Only visible to the player who currently has priority.
 */
const InactivityWarning = () => {
  const dispatch = useAppDispatch();
  const { sendQuickChat } = useSendGameChat();
  const { level, secondsInactive, secondsUntilOpponentInactivePrompt } =
    useInactivityWarning();
  const opponentInactivity = useOpponentInactivityWarning();
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const opponentActivity = useAppSelector(
    (state: RootState) => state.game.opponentActivity
  );
  const inactivityWarning = useAppSelector(
    (state: RootState) => state.game.inactivityWarning
  );
  const [isClaimingVictory, setIsClaimingVictory] = React.useState(false);

  const handleStillHereClick = () => {
    dispatch(stillHereButtonClicked());
    // Reset backend inactivity marker so the waiting player's Claim Victory disappears
    dispatch(
      submitInactivityMessage({
        playerID: gameInfo.playerID,
        inactivePlayer: gameInfo.playerID,
        reset: true
      })
    );
    // Send chat message via the game log
    sendQuickChat('Thinking... Please bear with me!');
  };

  const handleClaimVictoryClick = async () => {
    setIsClaimingVictory(true);
    try {
      await dispatch(
        submitButton({ button: { mode: 100007, buttonInput: '0' } })
      );
    } catch (e) {
      console.error('Error claiming victory:', e);
    } finally {
      setIsClaimingVictory(false);
    }
  };

  // Build debug display and warnings together
  const debugDisplay = DEBUG_MODE && (
    <div className={styles.debugContainer}>
      <div className={styles.debugContent}>
        <div>🔍 DEBUG MODE</div>
        <div>
          HasPriority: <strong>{hasPriority ? '✅ YES' : '❌ NO'}</strong>
        </div>
        <div>
          PlayerID: <strong>{gameInfo.playerID}</strong>
        </div>
        <div>
          IsSpectator:{' '}
          <strong>{gameInfo.playerID === 3 ? '✅ YES' : '❌ NO'}</strong>
        </div>
        <div>
          Seconds Inactive: <strong>{secondsInactive}s</strong>
        </div>
        <div>
          Warning Level: <strong>{level}</strong>
        </div>
        <div>
          OpponentActivity:{' '}
          <strong>
            {opponentActivity === 1 ? '❌ INACTIVE' : '✅ ACTIVE'}
          </strong>
        </div>
        <div>
          LastActionTime: <strong>{inactivityWarning?.lastActionTime}</strong>
        </div>
        <div>
          FirstWarningShown:{' '}
          <strong>{inactivityWarning?.firstWarningShown ? '✅' : '❌'}</strong>
        </div>
        <div>
          SecondWarningShown:{' '}
          <strong>{inactivityWarning?.secondWarningShown ? '✅' : '❌'}</strong>
        </div>
        <div>
          IsGamePrivate: <strong>{gameInfo.isPrivate ? '✅' : '❌'}</strong>
        </div>
        <div>
          IsOpponentAI: <strong>{gameInfo.isOpponentAI ? '✅' : '❌'}</strong>
        </div>
        <div>
          IsGameOver: <strong>{turnPhase === 'OVER' ? '✅' : '❌'}</strong>
        </div>
      </div>
    </div>
  );

  // Never show warnings for spectators, when game is over, is private or against AI
  if (
    gameInfo.playerID === 3 ||
    turnPhase === 'OVER' ||
    gameInfo.isPrivate ||
    gameInfo.isOpponentAI
  ) {
    return debugDisplay;
  }

  // --- Self-inactivity content (priority player is idle) ---
  const getSelfWarningContent = () => {
    if (!hasPriority) return null;

    const countdownToOpponentPrompt = secondsUntilOpponentInactivePrompt ?? 0;

    if (level === InactivityWarningLevel.FIRST_WARNING) {
      return {
        title: 'Still there?',
        message: 'Make a move or you may be marked inactive.',
        className: styles.warningFirst,
        timer: null
      };
    }

    if (
      level === InactivityWarningLevel.SECOND_WARNING ||
      level === InactivityWarningLevel.OPPONENT_INACTIVE
    ) {
      return {
        title: 'Inactivity Warning',
        message: "You've been inactive for 60+ seconds.",
        className: styles.warningSecond,
        timer: countdownToOpponentPrompt
      };
    }

    return null;
  };

  // --- Opponent-inactivity content (waiting player watching opponent go idle) ---
  const getOpponentWarningContent = () => {
    if (hasPriority) return null;

    if (opponentInactivity.level === OpponentInactivityLevel.GOING_INACTIVE) {
      return {
        title: 'Opponent Slowing Down',
        message: `Your opponent is going inactive in ${opponentInactivity.secondsUntilInactive}s.`,
        className: styles.warningFirst,
        showClaimVictory: false
      };
    }

    if (opponentInactivity.level === OpponentInactivityLevel.INACTIVE) {
      return {
        title: 'Opponent Inactive',
        message: 'Your opponent has been inactive for 60+ seconds.',
        className: styles.warningOpponent,
        showClaimVictory: true
      };
    }

    return null;
  };

  const selfContent = getSelfWarningContent();
  const opponentContent = getOpponentWarningContent();

  return (
    <>
      {debugDisplay}

      {/* Self-inactivity warning: shown when the priority player is idle */}
      <AnimatePresence>
        {selfContent && (
          <motion.div
            className={`${styles.warningContainer} ${selfContent.className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.warningContent}>
              <div className={styles.warningTitle}>{selfContent.title}</div>
              <div className={styles.warningMessage}>{selfContent.message}</div>
              {selfContent.timer !== null && (
                <div className={styles.timerDisplay}>
                  {selfContent.timer}s until marked inactive
                </div>
              )}
              {(level === InactivityWarningLevel.SECOND_WARNING ||
                level === InactivityWarningLevel.OPPONENT_INACTIVE) && (
                <div className={styles.buttonContainer}>
                  <button
                    className={styles.stillHereButton}
                    onClick={handleStillHereClick}
                  >
                    I'm still here!
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opponent-inactivity warning: shown to the waiting player when their opponent is idle */}
      <AnimatePresence>
        {opponentContent && (
          <motion.div
            className={`${styles.warningContainer} ${opponentContent.className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.warningContent}>
              <div className={styles.warningTitle}>{opponentContent.title}</div>
              <div className={styles.warningMessage}>
                {opponentContent.message}
              </div>
              {opponentContent.showClaimVictory && (
                <div className={styles.buttonContainer}>
                  <button
                    className={styles.leaveGameButton}
                    onClick={handleClaimVictoryClick}
                    disabled={isClaimingVictory}
                  >
                    {isClaimingVictory ? 'Leaving Game...' : 'Leave Game'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InactivityWarning;
