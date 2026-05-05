import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { useSubmitChatMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { useState, useEffect, useRef } from 'react';
import { shallowEqual } from 'react-redux';
import styles from './OpponentInactive.module.css';

const CLAIM_VICTORY_MODE = 100007;
const QUICK_CHAT_THINKING = 8;
const INACTIVITY_TIMEOUT_MS = 60_000; // 60 seconds, matches backend
const CHECK_INTERVAL_MS = 5_000;

export default function OpponentInactive() {
  const hasPriority = useAppSelector(
    (state: any) => state.game.hasPriority
  );
  const lastUpdate = useAppSelector(
    (state: any) => state.game.gameDynamicInfo?.lastUpdate
  );
  const turnPhase = useAppSelector(
    (state: any) => state.game.turnPhase?.turnPhase
  );
  const isRequestInProgress = useAppSelector(
    (state: any) => state.game.isUpdateInProgress
  );
  // hasn't been reset, so a chat from the non-priority player won't clear it.
  const backendInactive = useAppSelector(
    (state: any) => state.game.opponentInactive ?? false
  );
  const { playerID, gameID, authKey, isReplay } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const dispatch = useAppDispatch();
  const [submitChat] = useSubmitChatMutation();
  const [inactive, setInactive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const lastUpdateRef = useRef(lastUpdate);
  const lastUpdateTimeRef = useRef(Date.now());

  // Spectators and replay viewers don't see inactivity warnings
  const isSpectator = playerID === 3;

  // Track when lastUpdate changes to reset inactivity
  useEffect(() => {
    if (lastUpdate !== lastUpdateRef.current) {
      lastUpdateRef.current = lastUpdate;
      if (!backendInactive) {
        lastUpdateTimeRef.current = Date.now();
        setInactive(false);
        setDismissed(false);
      }
    }
  }, [lastUpdate, backendInactive]);

  // Poll for inactivity
  useEffect(() => {
    if (turnPhase === 'OVER') return;

    const interval = setInterval(() => {
      if (Date.now() - lastUpdateTimeRef.current > INACTIVITY_TIMEOUT_MS) {
        setInactive(true);
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [turnPhase]);

  if (!inactive || dismissed || turnPhase === 'OVER' || isSpectator || isReplay) return null;

  // The player with priority is the one who should be acting
  const amIInactive = hasPriority;

  if (amIInactive) {
    const handleStillHere = () => {
      setDismissed(true);
      submitChat({ playerID, gameID, authKey, quickChat: QUICK_CHAT_THINKING });
    };

    return (
      <div className={`${styles.overlay} ${styles.warning}`}>
        <span className={styles.icon}>⏳</span>
        <p className={styles.message}>You appear to be inactive — make a move!</p>
        <button
          className={styles.stillHereButton}
          onClick={handleStillHere}
          disabled={!!isRequestInProgress}
        >
          I'm Still Here
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
      <span className={styles.icon}>⚠️</span>
      <p className={styles.message}>Your opponent appears to be inactive</p>
      <button
        className={styles.leaveButton}
        onClick={handleClaimVictory}
        disabled={!!isRequestInProgress}
      >
        Claim Victory
      </button>
    </div>
  );
}
