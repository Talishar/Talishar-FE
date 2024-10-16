import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './TurnNumber.module.css';
import Player from 'interface/Player';

export default function TurnNumber() {
  let turnNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.turnNo
  );

  if (turnNumber === undefined) {
    turnNumber = 0;
  }

  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );

  const playerName = useAppSelector((state: RootState) =>
    state.game.turnPlayer ? state.game.playerOne.Name : state.game.playerTwo.Name
  );

  return (
    <div className={styles.turnNumber}>
      <div>TURN #{turnNumber}</div>
      <div>{playerName + "'s Turn"}</div>
    </div>
  );
}