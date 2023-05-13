import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import TurnWidget from '../elements/turnWidget/TurnWidget';
import { useCookies } from 'react-cookie';
import classNames from 'classnames';

export default function CombatChain() {
  const [cookie] = useCookies(['experimental']);
  const combatChainClasses = classNames(styles.combatChain, {
    [styles.experimental]: cookie.experimental
  });
  return (
    <div className={combatChainClasses}>
      <CurrentAttack />
      <div className={styles.chainCentre}>
        <ChainLinks />
        <Reactions />
      </div>
      <TurnWidget />
    </div>
  );
}
