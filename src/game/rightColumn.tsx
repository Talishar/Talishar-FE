import React from 'react';
import { LastPlayed } from './elements/lastPlayed';
import { Menu } from './elements/menu';
import { TurnNumber } from './elements/turnNumber';
import styles from './rightColumn.module.css';
import { ChatBox } from './elements/chatBox';
import { PhaseTracker } from './elements/phaseTracker';

export function RightColumn() {
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
