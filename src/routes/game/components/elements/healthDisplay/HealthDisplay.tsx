import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './HealthDisplay.module.css';

export default function HealthDisplay(props: Player) {
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const spectatorCameraView = useAppSelector((state: RootState) => state.game.spectatorCameraView);

  const playerOneHealth = useAppSelector((state: RootState) => state.game.playerOne.Health);
  const playerTwoHealth = useAppSelector((state: RootState) => state.game.playerTwo.Health);

  let health;
  if (playerID === 3) {
    if (spectatorCameraView === 2) {
      health = props.isPlayer ? playerTwoHealth : playerOneHealth;
    } else {
      health = props.isPlayer ? playerOneHealth : playerTwoHealth;
    }
  } else {
    health = props.isPlayer ? playerOneHealth : playerTwoHealth;
  }

  return (
    <div className={styles.health}>
      <div>{health}</div>
    </div>
  );
}
