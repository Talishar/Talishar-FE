import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { useTranslation } from 'react-i18next';
import { submitButton } from 'features/game/GameSlice';
import { useSubmitChatMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { useState, useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import styles from './OpponentInactive.module.css';

const CLAIM_VICTORY_MODE = 100007;
const QUICK_CHAT_THINKING = 8;
/** How much of the timeout is shown as a visible countdown. */
const COUNTDOWN_VISIBLE_MS = 15_000;
const TICK_MS = 500;

export default function OpponentInactive() {
  const hasPriority = useAppSelector((state: any) => state.game.hasPriority);
  const priorityPlayer = useAppSelector(
    (state: any) => state.game.priorityPlayer
  );
  const turnPhase = useAppSelector(
    (state: any) => state.game.turnPhase?.turnPhase
  );
  const isRequestInProgress = useAppSelector(
    (state: any) => state.game.isUpdateInProgress
  );
  // The backend's own verdict. Authoritative once the deadline passes, but it
  // only arrives over SSE, so the countdown below is driven by the deadline.
  const backendInactive = useAppSelector(
    (state: any) => state.game.opponentInactive ?? false
  );
  const inactivityDeadline = useAppSelector(
    (state: any) => state.game.inactivityDeadline
  );
  const serverTimeOffset = useAppSelector(
    (state: any) => state.game.serverTimeOffset ?? 0
  );
  const playerOneName = useAppSelector(
    (state: any) => state.game.playerOne?.Name
  );
  const playerTwoName = useAppSelector(
    (state: any) => state.game.playerTwo?.Name
  );
  const { playerID, gameID, authKey, isReplay } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const isOpponentAI = useAppSelector(
    (state: any) => state.game.gameInfo.isOpponentAI ?? false
  );
  const isPracticeDummy = useAppSelector(
    (state: any) =>
      state.game.playerOne?.Name === 'Practice Dummy' ||
      state.game.playerTwo?.Name === 'Practice Dummy'
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [submitChat] = useSubmitChatMutation();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isSpectator = playerID === 3;

  // A new deadline means somebody acted, so any earlier dismissal is stale.
  useEffect(() => {
    setDismissed(false);
  }, [inactivityDeadline]);

  useEffect(() => {
    if (!inactivityDeadline || turnPhase === 'OVER') {
      setRemainingMs(null);
      return;
    }
    const tick = () =>
      setRemainingMs(inactivityDeadline - (Date.now() + serverTimeOffset));
    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
  }, [inactivityDeadline, serverTimeOffset, turnPhase]);

  const expired =
    remainingMs !== null ? remainingMs <= 0 : Boolean(backendInactive);
  const showCountdown =
    !expired && remainingMs !== null && remainingMs <= COUNTDOWN_VISIBLE_MS;

  if (
    (!expired && !showCountdown) ||
    dismissed ||
    turnPhase === 'OVER' ||
    isReplay ||
    isOpponentAI ||
    isPracticeDummy
  )
    return null;

  // The player with priority is the one on the clock.
  const onTheClockName = priorityPlayer === 2 ? playerTwoName : playerOneName;
  const amIOnTheClock = !isSpectator && hasPriority;

  if (showCountdown) {
    const seconds = Math.max(0, Math.ceil((remainingMs as number) / 1000));
    // The bar depletes across the visible window rather than the full timeout,
    // so it actually travels over the few seconds it is on screen.
    const remainingFraction = (remainingMs as number) / COUNTDOWN_VISIBLE_MS;

    let countdownMessage: string;
    if (amIOnTheClock) {
      countdownMessage = t('OPPONENT_INACTIVE.COUNTDOWN_YOU');
    } else if (isSpectator) {
      countdownMessage = t('OPPONENT_INACTIVE.COUNTDOWN_PLAYER', {
        player: onTheClockName || `Player ${priorityPlayer ?? 1}`
      });
    } else {
      countdownMessage = t('OPPONENT_INACTIVE.COUNTDOWN_OPPONENT');
    }

    return (
      <div className={styles.overlay}>
        <div className={styles.countdown} role="timer" aria-live="off">
          {seconds}
          <span className={styles.countdownUnit}>s</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${Math.max(0, Math.min(100, remainingFraction * 100))}%`
            }}
          />
        </div>
        <p className={styles.message}>{countdownMessage}</p>
      </div>
    );
  }

  // Countdown reached zero.
  if (isSpectator) {
    return (
      <div className={styles.overlay}>
        <span className={styles.icon}>{t('OPPONENT_INACTIVE.WARNING')}</span>
        <p className={styles.message}>
          {t('OPPONENT_INACTIVE.PLAYER_INACTIVE', {
            player: onTheClockName || `Player ${priorityPlayer ?? 1}`
          })}
        </p>
      </div>
    );
  }

  if (amIOnTheClock) {
    const handleStillHere = () => {
      setDismissed(true);
      submitChat({ playerID, gameID, authKey, quickChat: QUICK_CHAT_THINKING });
    };

    return (
      <div className={`${styles.overlay} ${styles.warning}`}>
        <span className={styles.icon}>{t('OPPONENT_INACTIVE.HOURGLASS')}</span>
        <p className={styles.message}>{t('OPPONENT_INACTIVE.YOU_INACTIVE')}</p>
        <button
          className={styles.stillHereButton}
          onClick={handleStillHere}
          disabled={!!isRequestInProgress}
        >
          {t('OPPONENT_INACTIVE.IM_STILL_HERE')}
        </button>
      </div>
    );
  }

  const handleClaimVictory = () => {
    setDismissed(true);
    dispatch(
      submitButton({
        button: { mode: CLAIM_VICTORY_MODE, buttonInput: '0' }
      })
    );
  };

  return (
    <div className={styles.overlay}>
      <span className={styles.icon}>{t('OPPONENT_INACTIVE.WARNING')}</span>
      <p className={styles.message}>
        {t('OPPONENT_INACTIVE.OPPONENT_INACTIVE')}
      </p>
      <button
        className={styles.leaveButton}
        onClick={handleClaimVictory}
        disabled={!!isRequestInProgress}
      >
        {t('OPPONENT_INACTIVE.CLAIM_VICTORY')}
      </button>
    </div>
  );
}
