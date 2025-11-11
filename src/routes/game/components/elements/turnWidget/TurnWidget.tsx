import React, { useEffect, useState, useMemo } from 'react';
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

  const widgetBackground = useMemo(() => {
    // Ensure canPassPhase is a boolean to prevent classnames parsing issues
    const isCanPass = Boolean(canPassPhase === true);
    return classNames(styles.widgetBackground, {
      [styles.myTurn]: isCanPass,
      [styles.ourTurn]: !isCanPass
    });
  }, [canPassPhase]);

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
