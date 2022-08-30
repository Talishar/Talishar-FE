import React from 'react';
import { ActiveEffects } from './activeEffects';
import styles from './leftColumn.module.css';

export function LeftColumn() {
  return (
    <div className={styles.leftColumn}>
      <ActiveEffects />
    </div>
  );
}
