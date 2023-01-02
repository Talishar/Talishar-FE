import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import Player from '../../../interface/Player';
import styles from './ActionPointDisplay.module.css';

export default function ActionPointDisplay(props: Player) {
  const { isPlayer } = props;
  const APAvailable = useAppSelector((state: RootState) =>
    Math.max(
      state.game.playerOne.ActionPoints ?? 0,
      state.game.playerTwo.ActionPoints ?? 0
    )
  );

  const activePlayer = useAppSelector(
    (state: RootState) => state.game.activePlayer
  );

  return (
    <div className={styles.actionPointDisplay}>
      <div className={styles.actionPointCounter}>{APAvailable}</div>
    </div>
  );
}
