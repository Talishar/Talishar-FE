import React from 'react';
import LastPlayed from '../elements/lastPlayed/LastPlayed';
import Menu from '../elements/menu/Menu';
import TurnNumber from '../elements/turnNumber/TurnNumber';
import styles from './RightColumn.module.css';
import ChatBox from '../elements/chatBox/ChatBox';
import PhaseTracker from '../elements/phaseTracker/PhaseTracker';

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
