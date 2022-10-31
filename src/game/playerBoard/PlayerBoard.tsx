import React from 'react';
import TopRow from '../topRow/TopRow';
import MiddleRow from '../middleRow/MiddleRow';
import BottomRow from '../bottomRow/BottomRow';
import styles from './PlayerBoard.module.css';

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
