import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import Player from '../../../interface/Player';
import styles from './TurnWidget.module.css';

export default function HealthDisplay(props: Player) {
  const health = useAppSelector((state: RootState) =>
    props.isPlayer ? state.game.playerOne.Health : state.game.playerTwo.Health
  );

  return (
    <div className={styles.health}>
      <div>{health}</div>
    </div>
  );
}
