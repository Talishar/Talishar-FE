import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';
import styles from './board.module.css';

export function PlayerBoard() {
  return (
    <div
      className={styles.playerPlaymat}
      style={{ maxHeight: window.innerHeight * 0.35 }}
    >
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <TopRow isPlayer={true} />
        <MiddleRow isPlayer={true} />
        <BottomRow isPlayer={true} />
      </div>
    </div>
  );
}
