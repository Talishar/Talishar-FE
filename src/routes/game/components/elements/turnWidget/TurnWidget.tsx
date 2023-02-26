import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ActionPointDisplay from '../actionPointDisplay/ActionPointDisplay';
import HealthDisplay from '../healthDisplay/HealthDisplay';
import PassTurnDisplay from '../passTurnDisplay/PassTurnDisplay';
import styles from './TurnWidget.module.css';
import classNames from 'classnames';

export default function TurnWidget() {
  const [heightRatio, setHeightRatio] = useState(1);

  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  const widgetBackground = classNames(styles.widgetBackground, {
    [styles.myTurn]: canPassPhase,
    [styles.ourTurn]: !canPassPhase
  });

  return (
    <div className={styles.widgetContainer}>
      <div className={widgetBackground}>
        <div className={styles.widgetLeftCol}>
          <ActionPointDisplay isPlayer />
        </div>
        <div className={styles.widgetRightCol}>
          <HealthDisplay isPlayer={false} />
          <PassTurnDisplay />
          <HealthDisplay isPlayer />
        </div>
      </div>
    </div>
  );
}
