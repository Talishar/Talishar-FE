import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ActionPointDisplay from '../actionPointDisplay/ActionPointDisplay';
import HealthDisplay from '../healthDisplay/HealthDisplay';
import PassTurnDisplay from '../passTurnDisplay/PassTurnDisplay';
import styles from './ExperimentalTurnWidget.module.css';
import classNames from 'classnames';

export const ExperimentalTurnWidget = () => {
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
        <ActionPointDisplay isPlayer={false} />
        <HealthDisplay isPlayer={false} />
        <PassTurnDisplay />
        <ActionPointDisplay isPlayer />
        <HealthDisplay isPlayer />
      </div>
    </div>
  );
};

export default ExperimentalTurnWidget;
