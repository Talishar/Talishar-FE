import React from 'react';
import TopRow from './Toprow';
import MiddleRow from './Middlerow';
import BottomRow from './Bottomrow';
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
