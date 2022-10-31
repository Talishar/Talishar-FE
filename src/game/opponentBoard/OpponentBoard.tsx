import React from 'react';
import TopRow from '../topRow/TopRow';
import MiddleRow from '../middleRow/MiddleRow';
import BottomRow from '../bottomRow/BottomRow';
import styles from './OpponentBoard.module.css';
import CardPopUp from '../elements/cardPopUp/CardPopUp';

export default function OpponentBoard() {
  return (
    <div className={styles.opponentPlaymat}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
        <CardPopUp />
      </div>
    </div>
  );
}
