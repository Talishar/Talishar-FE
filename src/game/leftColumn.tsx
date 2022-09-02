import React from 'react';
import ActiveEffects from './ActiveEffects';
import PlayerName from './elements/PlayerName';
import styles from './LeftColumn.module.css';

export default function LeftColumn() {
  return (
    <div className={styles.leftColumn}>
      <PlayerName isPlayer={false} />
      <ActiveEffects />
      <PlayerName isPlayer />
    </div>
  );
}
