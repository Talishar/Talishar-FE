import React from 'react';
import { RootState } from '../../../app/Store';
import styles from './CurrentAttack.module.css';
import attackSymbol from '../../../img/symbols/symbol-attack.png';
import defSymbol from '../../../img/symbols/symbol-defence.png';
import CardDisplay from '../cardDisplay/CardDisplay';
import { useAppSelector } from '../../../app/Hooks';

export default function CurrentAttack() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  if (
    activeCombatChain === undefined ||
    activeCombatChain.attackingCard === undefined ||
    activeCombatChain.attackingCard.cardNumber === 'blank'
  ) {
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
        <CardDisplay card={attCard} makeMeBigger={true} />
        <div className={styles.floatCover}>
          {activeCombatChain.goAgain ? (
            <div className={styles.icon}>
              <i
                className="fa fa-refresh"
                aria-hidden="true"
                title="Go Again"
              ></i>
            </div>
          ) : null}
          {activeCombatChain.dominate ? (
            <div className={styles.icon}>
              <i
                className="fa fa-bullseye"
                aria-hidden="true"
                title="Dominate"
              ></i>
            </div>
          ) : null}
          {activeCombatChain.overpower ? (
            <div className={styles.icon}>
              <i
                className="fa fa-bolt"
                aria-hidden="true"
                title="Overpower"
              ></i>
            </div>
          ) : null}
          {activeCombatChain.fused ? (
            <div className={styles.icon}>
              <i className="fa fa-leaf" aria-hidden="true" title="Fused"></i>
            </div>
          ) : null}
          {activeCombatChain.damagePrevention ? (
            <div className={styles.icon}>
              <i
                className="fa fa-shield"
                aria-hidden="true"
                title="Damage Prevention"
              >
                {activeCombatChain.damagePrevention}
              </i>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
