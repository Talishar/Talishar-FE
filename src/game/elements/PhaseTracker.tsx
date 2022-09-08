import React from 'react';
import { TypeFlags } from 'typescript';
import styles from './PhaseTracker.module.css';
import PhaseTrackerWidget from './PhaseTrackerWidget';

export default function PhaseTracker() {
  const activePhase = 'Attack Reaction Phase';
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.titleInterior}>What is love?</div>
      </div>
      <PhaseTrackerWidget />
      <div className={styles.phaseTrackerBottomContainer}>
        <div className={styles.bottomInterior}>{activePhase}</div>
      </div>
    </div>
  );
}
