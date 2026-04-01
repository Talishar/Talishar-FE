import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { useState } from 'react';
import styles from './OpponentInactive.module.css';

const CLAIM_VICTORY_MODE = 100007;

export default function OpponentInactive() {
  const opponentInactive = useAppSelector(
    (state: any) => state.game.opponentInactive
  );
  const isRequestInProgress = useAppSelector(
    (state: any) => state.game.isUpdateInProgress
  );
  const dispatch = useAppDispatch();
  const [submitted, setSubmitted] = useState(false);

  if (!opponentInactive || submitted) return null;

  const handleLeave = () => {
    setSubmitted(true);
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
        onClick={handleLeave}
        disabled={!!isRequestInProgress}
      >
        Leave Game
      </button>
    </div>
  );
}
