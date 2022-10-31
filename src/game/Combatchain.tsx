import React from 'react';
import styles from './Board.module.css';
import ChainLinks from './elements/chainLinks/ChainLinks';
import CurrentAttack from './elements/CurrentAttack';
import Reactions from './elements/Reactions';
import TurnWidget from './elements/TurnWidget';

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
