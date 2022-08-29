import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';
import styles from './board.module.css';

export function PlayerBoard() {
  const height = (window.innerHeight / 8) * 3;
  return (
    <div className={styles.playerPlaymat} style={{ height: height }}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <TopRow isPlayer={true} />
        <MiddleRow isPlayer={true} />
        <BottomRow isPlayer={true} />
      </div>
    </div>
  );
}
