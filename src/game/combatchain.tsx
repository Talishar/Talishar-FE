import React from 'react';
import styles from './board.module.css';
import { ChainLinks } from './elements/chainLinks';
import { CurrentAttack } from './elements/currentAttack';
import { Reactions } from './elements/reactions';
import { TurnWidget } from './elements/turnWidget';

export function CombatChain() {
  return (
    <div className={styles.combatChain}>
      <CurrentAttack />
      <div className={styles.chainCentre}>
        <ChainLinks />
        <Reactions />
      </div>
      <TurnWidget />
    </div>
  );
}
