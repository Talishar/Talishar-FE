import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import styles from './combatChain.module.css';
import attackSymbol from '../../img/symbols/symbol-attack.png';
import defSymbol from '../../img/symbols/symbol-defence.png';
import { CardDisplay } from './card';

export function CurrentAttack() {
  const activeCombatChain = useSelector(
    (state: RootState) => state.game.activeCombatChain
  );
  if (activeCombatChain === undefined) {
    return <div className={styles.currentAttack}></div>;
  }

  const attackValue = activeCombatChain.totalAttack;
  const defValue = activeCombatChain.totalDefence;
  const attCard = activeCombatChain.attackingCard;

  return (
    <div className={styles.currentAttack}>
      <div className={styles.attDefRow}>
        <div className={styles.attDiv}>{attackValue}</div>
        <div className={styles.attackSymbol}>
          <img className={styles.chainSymbols} src={attackSymbol} />
        </div>
        <div className={styles.attackSymbol}>
          <img className={styles.chainSymbols} src={defSymbol} />
        </div>
        <div className={styles.defDiv}>{defValue}</div>
      </div>
      <div className={styles.attDefRow}>
        <i className="fa fa-refresh" aria-hidden="true"></i>
        <i className="fa fa-times-circle" aria-hidden="true"></i>
      </div>
      <CardDisplay card={attCard} />
    </div>
  );
}
