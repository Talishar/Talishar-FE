import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';
import styles from './board.module.css';

export function OpponentBoard() {
  return (
    <div
      className={styles.opponentPlaymat}
      style={{ maxHeight: window.innerHeight * 0.35 }}
    >
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
      </div>
    </div>
  );
}
