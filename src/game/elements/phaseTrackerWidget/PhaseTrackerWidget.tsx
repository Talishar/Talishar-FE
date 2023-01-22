import React from 'react';
import styles from './PhaseTrackerWidget.module.css';

export interface TurnPhase {
  phase?: string;
}

export default function PhaseTrackerWidget({ phase }: TurnPhase) {
  let styleToApply = { left: '0em' };
  console.log(phase);
  switch (phase) {
    case 'M':
      styleToApply = { left: '0.42em' };
      break;
    case 'B':
      styleToApply = { left: '5.08em' };
      break;
    case 'A':
      styleToApply = { left: '7.08em' };
      break;
    case 'D':
      styleToApply = { left: '7.08em' };
      break;
    case 'ARS':
      styleToApply = { left: '9.73em' };
      break;
    case 'PDECK':
      styleToApply = { left: '9.73em' };
      break;
    default:
      break;
  }

  return (
    <div className={styles.phaseWidget}>
      <div className={styles.icon} style={styleToApply}></div>
    </div>
  );
}
