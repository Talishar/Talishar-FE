import React, { useEffect } from 'react';
import { playCard, submitButton } from '../../../features/game/GameSlice';
import { useAppSelector, useAppDispatch } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './PassTurnDisplay.module.css';

export default function PassTurnDisplay() {
  const activePlayer = useAppSelector(
    (state: RootState) => state.game.activePlayer
  );

  const dispatch = useAppDispatch();

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: 99 } }));
  };

  const pressKey = (e: KeyboardEvent) => {
    if (e.key == ' ') {
      onPassTurn();
    }
  };

  // TODO: Migrate the key listeners to a separate component
  // component can have customisable keys maybe
  useEffect(() => {
    document.addEventListener('keydown', pressKey, true);
    // return document.removeEventListener('keydown', pressKey, true);
  }, []);

  if (activePlayer === undefined) {
    return <div className={styles.passTurnDisplay}>Whut</div>;
  }

  if (activePlayer === 1) {
    return (
      <div className={styles.passTurnDisplayActive} onClick={onPassTurn}>
        PASS <br />
        [spacebar]
      </div>
    );
  }

  if (activePlayer === 2) {
    return <div className={styles.passTurnDisplay}>WAITING</div>;
  }

  return null;
}
