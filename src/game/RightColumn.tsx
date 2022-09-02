import React from 'react';
import LastPlayed from './elements/LastPlayed';
import Menu from './elements/Menu';
import TurnNumber from './elements/TurnNumber';
import styles from './RightColumn.module.css';
import ChatBox from './elements/ChatBox';
import PhaseTracker from './elements/PhaseTracker';

export default function RightColumn() {
  return (
    <div className={styles.rightColumn}>
      <div className={styles.topGroup}>
        <Menu />
        <TurnNumber />
        <LastPlayed />
        <PhaseTracker />
      </div>
      <div className={styles.bottomGroup}>
        <ChatBox />
      </div>
    </div>
  );
}
