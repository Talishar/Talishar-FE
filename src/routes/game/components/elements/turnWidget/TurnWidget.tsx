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
  const [buttonState, setButtonState] = useState<'normal' | 'hover' | 'press'>('normal');

  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  const widgetBackground = useMemo(() => {
    const isCanPass = Boolean(canPassPhase === true);
    const backgroundClass = (() => {
      if (!isCanPass) return styles.ourTurn;
      if (buttonState === 'press') return styles.myTurnPress;
      if (buttonState === 'hover') return styles.myTurnHover;
      return styles.myTurn;
    })();
    
    return classNames(styles.widgetBackground, backgroundClass);
  }, [canPassPhase, buttonState]);

  return (
    <div className={styles.widgetContainer}>
      <div className={widgetBackground}>
          <div className={styles.mainContent}>
            <div className={styles.widgetLeftCol}>
              <ActionPointDisplay isPlayer={false} />
              <PassTurnDisplay onStateChange={setButtonState} />
              <ActionPointDisplay isPlayer />
            </div>
            <div className={styles.widgetRightCol}>
              <HealthDisplay isPlayer={false} />
              <HealthDisplay isPlayer />
            </div>
          </div>
      </div>
    </div>
  );
}
