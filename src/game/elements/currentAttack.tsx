import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import styles from './combatChain.module.css';
import attackSymbol from '../../img/symbols/symbol-attack.png';
import defSymbol from '../../img/symbols/symbol-defence.png';
import { CardDisplay } from './card';

export default function CurrentAttack() {
  const activeCombatChain = useSelector(
    (state: RootState) => state.game.activeCombatChain
  );
  if (activeCombatChain === undefined) {
    return <div className={styles.currentAttack} />;
  }

  const attackValue = activeCombatChain.totalAttack;
  const defValue = activeCombatChain.totalDefence;
  const attCard = activeCombatChain.attackingCard;

  return (
    <div className={styles.currentAttack}>
      <div className={styles.attDefRow}>
        <div className={styles.attDiv}>{attackValue}</div>
        <div className={styles.attackSymbol}>
          <img
            className={styles.chainSymbols}
            src={attackSymbol}
            alt="attack symbol"
          />
        </div>
        <div className={styles.attackSymbol}>
          <img
            className={styles.chainSymbols}
            src={defSymbol}
            alt="attack symbol"
          />
        </div>
        <div className={styles.defDiv}>{defValue}</div>
      </div>
      <div className={styles.attack}>
        <CardDisplay card={attCard} />
      </div>
    </div>
  );
}
