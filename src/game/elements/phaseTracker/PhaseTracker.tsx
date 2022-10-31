import React from 'react';
import styles from './PhaseTracker.module.css';
import PhaseTrackerWidget from '../phaseTrackerWidget/PhaseTrackerWidget';

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
