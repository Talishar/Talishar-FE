import React from 'react';
import styles from './ActiveEffects.module.css';
import Effects from '../elements/effects/Effects';
import LandmarkZone from '../zones/LandmarkZone';

export default function ActiveEffects() {
  return (
    <div className={styles.activeEffects}>
      <div className={styles.textOpp}>Opp effects</div>
      <Effects isPlayer={false} />
      <LandmarkZone />
      <Effects isPlayer />
      <div className={styles.textPlayer}>Your effects</div>
    </div>
  );
}
