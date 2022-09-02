import React from 'react';
import TopRow from './TopRow';
import MiddleRow from './MiddleRow';
import BottomRow from './BottomRow';
import styles from './Board.module.css';

export default function OpponentBoard() {
  return (
    <div className={styles.opponentPlaymat}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
      </div>
    </div>
  );
}
