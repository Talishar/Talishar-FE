import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  useInactivityWarning,
  InactivityWarningLevel
} from 'hooks/useInactivityWarning';
import { useSendGameChat } from 'hooks/useSendGameChat';
import { stillHereButtonClicked } from 'features/game/GameSlice';
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
  const { level, secondsInactive, secondsUntilOpponentInactivePrompt } = useInactivityWarning();
  const hasPriority = useAppSelector((state: RootState) => state.game.hasPriority);
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const turnPhase = useAppSelector((state: RootState) => state.game.turnPhase?.turnPhase);
  const inactivityWarning = useAppSelector(
    (state: RootState) => state.game.inactivityWarning
  );

  const handleStillHereClick = () => {
    dispatch(stillHereButtonClicked());
    // Send chat message via the game log
    sendQuickChat('Thinking... Please bear with me!');
  };

  // Build debug display and warnings together
  const debugDisplay = DEBUG_MODE && (
    <div className={styles.debugContainer}>
      <div className={styles.debugContent}>
        <div>🔍 DEBUG MODE</div>
        <div>HasPriority: <strong>{hasPriority ? '✅ YES' : '❌ NO'}</strong></div>
        <div>PlayerID: <strong>{gameInfo.playerID}</strong></div>
        <div>IsSpectator: <strong>{gameInfo.playerID === 3 ? '✅ YES' : '❌ NO'}</strong></div>
        <div>Seconds Inactive: <strong>{secondsInactive}s</strong></div>
        <div>Warning Level: <strong>{level}</strong></div>
        <div>LastActionTime: <strong>{inactivityWarning?.lastActionTime}</strong></div>
        <div>FirstWarningShown: <strong>{inactivityWarning?.firstWarningShown ? '✅' : '❌'}</strong></div>
        <div>SecondWarningShown: <strong>{inactivityWarning?.secondWarningShown ? '✅' : '❌'}</strong></div>
        <div>IsGamePrivate: <strong>{gameInfo.isPrivate ? '✅' : '❌'}</strong></div>
        <div>IsOpponentAI: <strong>{gameInfo.isOpponentAI ? '✅' : '❌'}</strong></div>
        <div>IsGameOver: <strong>{turnPhase === 'OVER' ? '✅' : '❌'}</strong></div>
      </div>
    </div>
  );

  // Don't show warnings for spectators, players without priority, when game is over, is private or against AI
  if (!hasPriority || gameInfo.playerID === 3 || turnPhase === "OVER" || gameInfo.isPrivate || gameInfo.isOpponentAI) {
    return debugDisplay;
  }

  const getWarningContent = () => {
    const secondsUntilCritical = 60 - secondsInactive;
    const countdownToOpponentPrompt = secondsUntilOpponentInactivePrompt ?? 0;

    if (level === InactivityWarningLevel.FIRST_WARNING) {
      return {
        title: '⚠️ You\'re taking a while...',
        message: `Make a move or you may be marked inactive.`,
        className: styles.warningFirst,
        timer: null
      };
    }

    if (level === InactivityWarningLevel.SECOND_WARNING || level === InactivityWarningLevel.OPPONENT_INACTIVE) {
      return {
        title: '🔴 Inactivity Warning',
        message: `You\'ve been inactive for 60+ seconds. Try making a move.`,
        className: styles.warningSecond,
        timer: countdownToOpponentPrompt
      };
    }

    return null;
  };

  const content = getWarningContent();

  return (
    <>
      {debugDisplay}
      <AnimatePresence>
        {content && (
          <motion.div
            className={`${styles.warningContainer} ${content.className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.warningContent}>
              <div className={styles.warningTitle}>{content.title}</div>
              <div className={styles.warningMessage}>{content.message}</div>
              {content.timer !== null && (
                <div className={styles.timerDisplay}>
                  ⏱️ {content.timer}s until you become inactive
                </div>
              )}
              {level === InactivityWarningLevel.SECOND_WARNING || level === InactivityWarningLevel.OPPONENT_INACTIVE ? (
                <button className={styles.stillHereButton} onClick={handleStillHereClick}>
                  I'm still here!
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InactivityWarning;
