import React from 'react';
import ActionPointDisplay from './ActionPointDisplay';
import HealthDisplay from './HealthDisplay';
import PassTurnDisplay from './PassTurnDisplay';
import styles from './TurnWidget.module.css';

export default function TurnWidget() {
  return (
    <div className={styles.widgetContainer}>
      <div className={styles.widgetGraphic}>
        <div className={styles.widgetLeftCol}>
          <ActionPointDisplay isPlayer={false} />
          <PassTurnDisplay />
          <ActionPointDisplay isPlayer />
        </div>
        <div className={styles.widgetRightCol}>
          <HealthDisplay isPlayer={false} />
          <HealthDisplay isPlayer />
        </div>
      </div>
    </div>
  );
}
