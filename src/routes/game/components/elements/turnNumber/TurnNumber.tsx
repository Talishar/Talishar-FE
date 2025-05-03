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

  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );

  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });

  const playerName = useAppSelector((state: RootState) =>
    (turnPlayer == 1 && amIPlayerOne || turnPlayer == 2 && !amIPlayerOne) ? state.game.playerOne.Name : state.game.playerTwo.Name
  );

  return (
    <div className={styles.turnNumber}>
      <div>{(playerName?.substring(0, 15) ?? "Unknown") + "'s Turn"}</div>
      <div>Turn #{turnNumber}</div>
    </div>
  );
}