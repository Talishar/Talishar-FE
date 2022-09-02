import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';
import styles from './board.module.css';

export function PlayerBoard() {
  return (
    <div className={styles.playerPlaymat}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <TopRow isPlayer />
        <MiddleRow isPlayer />
        <BottomRow isPlayer />
      </div>
    </div>
  );
}
