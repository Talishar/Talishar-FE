import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Player from '../../interface/player';
import styles from './TurnWidget.module.css';

export default function ActionPointDisplay(props: Player) {
  const { isPlayer } = props;
  const APAvailable = useSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.ActionPoints
      : state.game.playerTwo.ActionPoints
  );

  const activePlayer = useSelector(
    (state: RootState) => state.game.activePlayer
  );

  if (activePlayer === undefined) {
    return null;
  }

  const extras = APAvailable !== 1 ? 's' : '';

  if (activePlayer === 1 && isPlayer) {
    return (
      <div className={styles.actionPointDisplay}>
        {APAvailable} Action Point{extras}
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
