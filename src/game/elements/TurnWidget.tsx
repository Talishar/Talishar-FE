import React, { useEffect, useState } from 'react';
import ActionPointDisplay from './ActionPointDisplay';
import HealthDisplay from './HealthDisplay';
import PassTurnDisplay from './PassTurnDisplay';
import styles from './TurnWidget.module.css';

const defaultInnerHeight = 940;

export default function TurnWidget() {
  const [heightRatio, setHeightRatio] = useState(1);
  console.log(window.innerHeight);
  useEffect(() => {
    function calculateWidgetHeight() {
      return window.innerHeight / defaultInnerHeight;
    }
    setHeightRatio(calculateWidgetHeight());
  }, [window.innerHeight]);
  const style = { transform: `scale(${heightRatio})` };
  console.log(style);
  return (
    <div className={styles.widgetContainer} style={style}>
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
