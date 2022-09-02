import React from 'react';
import { ActiveEffects } from './activeEffects';
import { PlayerName } from './elements/playerName';
import styles from './leftColumn.module.css';

export function LeftColumn() {
  return (
    <div className={styles.leftColumn}>
      <PlayerName isPlayer={false} />
      <ActiveEffects />
      <PlayerName isPlayer />
    </div>
  );
}
