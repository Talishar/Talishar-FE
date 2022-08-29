import React from 'react';
import styles from './board.module.css';

export function CombatChain() {
  const height = (window.innerHeight / 8) * 1.5;
  return (
    <div className={styles.combatChain} style={{ height: height }}>
      COMBAT CHANE PEW PEW PEW
    </div>
  );
}
