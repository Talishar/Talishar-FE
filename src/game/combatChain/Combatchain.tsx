import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import TurnWidget from '../elements/turnWidget/TurnWidget';

export default function CombatChain() {
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
