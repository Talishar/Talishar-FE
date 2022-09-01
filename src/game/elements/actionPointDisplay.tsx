import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Player } from '../../interface/player';
import styles from './turnWidget.module.css';

export function ActionPointDisplay(props: Player) {
  const APAvailable = props.isPlayer
    ? useSelector((state: RootState) => state.game.playerOne.ActionPoints)
    : useSelector((state: RootState) => state.game.playerTwo.ActionPoints);

  const activePlayer = useSelector(
    (state: RootState) => state.game.activePlayer
  );

  if (activePlayer === undefined) {
    return <></>;
  }

  const extras = APAvailable !== 1 ? 's' : '';

  if (activePlayer === 1 && props.isPlayer) {
    return (
      <div className={styles.actionPointDisplay}>
        {APAvailable} Action Point{extras}
      </div>
    );
  }

  if (activePlayer === 2 && props.isPlayer === false) {
    return (
      <div>
        {APAvailable} Action Point{extras}
      </div>
    );
  }

  return <></>;
}
