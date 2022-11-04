import React from 'react';
import styles from './PhaseTracker.module.css';
import PhaseTrackerWidget from '../phaseTrackerWidget/PhaseTrackerWidget';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';

export default function PhaseTracker() {
  const activePhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.caption
  );
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
