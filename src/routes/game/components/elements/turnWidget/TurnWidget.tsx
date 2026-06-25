import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ActionPointDisplay from '../actionPointDisplay/ActionPointDisplay';
import HealthDisplay from '../healthDisplay/HealthDisplay';
import PassTurnDisplay from '../passTurnDisplay/PassTurnDisplay';
import styles from './TurnWidget.module.css';
import classNames from 'classnames';

export default function TurnWidget() {
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  const widgetClass = classNames(styles.widget, {
    [styles.myTurn]: canPassPhase === true
  });

  return (
    <div className={styles.widgetContainer}>
      <div className={widgetClass}>
        <div className={styles.apBadge}>
          <ActionPointDisplay isPlayer />
        </div>
        <HealthDisplay isPlayer={false} />
        <PassTurnDisplay />
        <HealthDisplay isPlayer />
      </div>
    </div>
  );
}
