import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import ActionPointDisplay from '../actionPointDisplay/ActionPointDisplay';
import HealthDisplay from '../healthDisplay/HealthDisplay';
import PassTurnDisplay from '../passTurnDisplay/PassTurnDisplay';
import styles from './TurnWidget.module.css';

const defaultInnerHeight = 940;
const baseHeight = 210;
const baseWidth = 350;

export default function TurnWidget() {
  const [heightRatio, setHeightRatio] = useState(1);

  const activePlayer = useAppSelector(
    (state: RootState) => state.game.activePlayer
  );

  const graphicStyle =
    activePlayer === 1
      ? styles.widgetGraphicMyTurn
      : styles.widgetGraphicTheirTurn;

  useEffect(() => {
    function calculateWidgetHeight() {
      return window.innerHeight / defaultInnerHeight;
    }
    setHeightRatio(calculateWidgetHeight());
  }, [window.innerHeight]);

  const style = { transform: `scale(${heightRatio})` };

  const containerStyle = {
    height: `${baseHeight * heightRatio}px`,
    width: `${baseWidth * heightRatio}px`
  };

  return (
    <div className={styles.widgetContainer} style={containerStyle}>
      <div className={styles.widgetScaler} style={style}>
        <div className={graphicStyle}>
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
    </div>
  );
}
