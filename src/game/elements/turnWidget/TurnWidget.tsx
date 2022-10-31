import React, { useEffect, useState } from 'react';
import ActionPointDisplay from '../actionPointDisplay/ActionPointDisplay';
import HealthDisplay from '../healthDisplay/HealthDisplay';
import PassTurnDisplay from '../passTurnDisplay/PassTurnDisplay';
import styles from './TurnWidget.module.css';

const defaultInnerHeight = 940;
const baseHeight = 210;
const baseWidth = 350;

export default function TurnWidget() {
  const [heightRatio, setHeightRatio] = useState(1);

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
    </div>
  );
}
