import React from 'react';
import styles from './activeEffects.module.css';
import { Effects } from './elements/effects';

export function ActiveEffects() {
  return (
    <div className={styles.activeEffects}>
      <div className={styles.text}>Opp effects</div>
      <Effects isPlayer={false} />
      <Effects isPlayer />
      <div className={styles.text}>Your effects</div>
    </div>
  );
}
