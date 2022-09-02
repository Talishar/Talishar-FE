import React from 'react';
import { ActionPointDisplay } from './actionPointDisplay';
import { Health } from './healthDisplay';
import { PassTurnDisplay } from './passTurnDisplay';
import styles from './turnWidget.module.css';

export function TurnWidget() {
  return (
    <div className={styles.widgetContainer}>
      <div className={styles.widgetGraphic}>
        <div className={styles.widgetLeftCol}>
          <ActionPointDisplay isPlayer={false} />
          <PassTurnDisplay />
          <ActionPointDisplay isPlayer />
        </div>
        <div className={styles.widgetRightCol}>
          <Health isPlayer={false} />
          <Health isPlayer />
        </div>
      </div>
    </div>
  );
}
