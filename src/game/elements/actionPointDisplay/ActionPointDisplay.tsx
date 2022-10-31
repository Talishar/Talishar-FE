import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import Player from '../../../interface/Player';
import styles from './TurnWidget.module.css';

export default function ActionPointDisplay(props: Player) {
  const { isPlayer } = props;
  const APAvailable = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.ActionPoints
      : state.game.playerTwo.ActionPoints
  );

  const activePlayer = useAppSelector(
    (state: RootState) => state.game.activePlayer
  );

  if (activePlayer === undefined) {
    return null;
  }

  const extras = APAvailable !== 1 ? 's' : '';

  if (activePlayer === 1 && isPlayer) {
    return (
      <div className={styles.actionPointDisplay}>
        {APAvailable} AP{extras}
      </div>
    );
  }

  if (activePlayer === 2 && isPlayer === false) {
    return (
      <div>
        {APAvailable} Action Point{extras}
      </div>
    );
  }

  return null;
}
