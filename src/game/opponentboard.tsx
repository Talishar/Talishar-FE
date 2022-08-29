import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';
import styles from './board.module.css';

export function OpponentBoard() {
  const height = (window.innerHeight / 8) * 3;
  return (
    <div className={styles.opponentPlaymat} style={{ height: height }}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
      </div>
    </div>
  );
}
