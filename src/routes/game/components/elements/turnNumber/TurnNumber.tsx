import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './TurnNumber.module.css';

export default function TurnNumber() {
  let turnNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.turnNo
  );

  if (turnNumber === undefined) {
    turnNumber = 0;
  }

  return (
    <div className={styles.turnNumber}>
      <div>TURN #{turnNumber}</div>
    </div>
  );
}
