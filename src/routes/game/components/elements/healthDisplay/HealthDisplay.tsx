import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './HealthDisplay.module.css';

export default function HealthDisplay(props: Player) {
  const isPlayer = props.isPlayer;
  const health = useAppSelector((state: RootState) => {
    const { playerID, isReplay } = state.game.gameInfo;
    const isP2View = (playerID === 3 || isReplay) && state.game.spectatorCameraView === 2;
    return isPlayer
      ? (isP2View ? state.game.playerTwo.Health : state.game.playerOne.Health)
      : (isP2View ? state.game.playerOne.Health : state.game.playerTwo.Health);
  });

  return (
    <div className={styles.health}>
      <div className={styles.tick}>
        {health}
      </div>
    </div>
  );
}
