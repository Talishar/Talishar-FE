import React from 'react';
import TopRow from './TopRow';
import MiddleRow from './MiddleRow';
import BottomRow from './BottomRow';
import styles from './Board.module.css';

export default function PlayerBoard() {
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
