import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Player from '../../interface/Player';
import styles from './TurnWidget.module.css';

export default function HealthDisplay(props: Player) {
  const health = props.isPlayer
    ? useSelector((state: RootState) => state.game.playerOne.Health)
    : useSelector((state: RootState) => state.game.playerTwo.Health);

  return (
    <div className={styles.health}>
      <div>{health}</div>
    </div>
  );
}
