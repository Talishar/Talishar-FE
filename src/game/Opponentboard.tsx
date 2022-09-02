import React from 'react';
import TopRow from './Toprow';
import MiddleRow from './Middlerow';
import BottomRow from './Bottomrow';
import styles from './Board.module.css';
import CardPopUp from './elements/CardPopUp';

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
