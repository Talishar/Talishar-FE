import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './TurnWidget.module.css';

export default function PassTurnDisplay() {
  const activePlayer = useAppSelector(
    (state: RootState) => state.game.activePlayer
  );

  if (activePlayer === undefined) {
    return <div className={styles.passTurnDisplay}>Whut</div>;
  }

  if (activePlayer === 1) {
    return <div className={styles.passTurnDisplay}>PASS [spacebar]</div>;
  }

  if (activePlayer === 2) {
    return <div className={styles.passTurnDisplay}>WAITING</div>;
  }

  return null;
}
