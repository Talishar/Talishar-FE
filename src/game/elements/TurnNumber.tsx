import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import styles from '../RightColumn.module.css';

export default function TurnNumber() {
  let turnNumber = useSelector(
    (state: RootState) => state.game.gameInfo.turnNo
  );

  if (turnNumber === undefined) {
    turnNumber = 0;
  }

  return (
    <div className={styles.turnNumber}>
      <div>TURN No.{turnNumber}</div>
    </div>
  );
}
