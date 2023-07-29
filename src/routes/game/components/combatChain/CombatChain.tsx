import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import TurnWidget from '../elements/turnWidget/TurnWidget';
import { useCookies } from 'react-cookie';
import ExperimentalTurnWidget from '../elements/experimentalTurnWidget/ExperimentalTurnWidget';

export default function CombatChain() {
  const [cookies] = useCookies(['experimental']);
  console.log('cookies', cookies);
  return (
    <div className={styles.combatChain}>
      <CurrentAttack />
      <div className={styles.chainCentre}>
        <ChainLinks />
        <Reactions />
      </div>
      {cookies.experimental ? <ExperimentalTurnWidget /> : <TurnWidget />}
    </div>
  );
}
