import useWindowDimensions from 'hooks/useWindowDimensions';
import React from 'react';
import styles from './PhaseTrackerWidget.module.css';

export interface TurnPhase {
  phase?: string;
}

export default function PhaseTrackerWidget({ phase }: TurnPhase) {
  const [windowWidth, windowHeight] = useWindowDimensions();

  // height of component needs to be 9vh;
  const scaleFactor = 0.09 * (windowHeight / 85);
  let styleToApply = { left: '7px' };

  switch (phase) {
    case 'M':
      styleToApply = { left: '7px' };
      break;
    case 'P':
      styleToApply = { left: '44.5px' };
      break;
    case 'B':
      styleToApply = { left: '75px' };
      break;
    case 'A':
      styleToApply = { left: '105.5px' };
      break;
    case 'D':
      styleToApply = { left: '105.5px' };
      break;
    case 'ARS':
      styleToApply = { left: '143.5px' };
      break;
    case 'PDECK':
      styleToApply = { left: '143.5px' };
      break;
    default:
      styleToApply = { left: '7px' };
      break;
  }

  return (
    <div className={styles.notScaled}>
      <div
        className={styles.phaseWidget}
        style={{ transform: `scale(${scaleFactor})` }}
      >
        <div className={styles.icon} style={styleToApply}></div>
      </div>
    </div>
  );
}
