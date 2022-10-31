import React from 'react';
import styles from './ActiveEffects.module.css';
import Effects from '../elements/effects/Effects';

export default function ActiveEffects() {
  return (
    <div className={styles.activeEffects}>
      <div className={styles.text}>Opp effects</div>
      <Effects isPlayer={false} />
      <Effects isPlayer />
      <div className={styles.text}>Your effects</div>
    </div>
  );
}
