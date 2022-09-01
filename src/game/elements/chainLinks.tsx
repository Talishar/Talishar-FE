import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import styles from './combatChain.module.css';
import attack from '../../img/symbols/symbol-attack.png';
import defend from '../../img/symbols/symbol-defence.png';

export function ChainLinks() {
  const oldCombatChain = useSelector(
    (state: RootState) => state.game.oldCombatChain
  );
  if (oldCombatChain === undefined || oldCombatChain.length === 0) {
    return <div className={styles.chainLinksRow}></div>;
  }

  return (
    <div className={styles.chainLinksRow}>
      {oldCombatChain.map((ChainLink, ix) => {
        const hitPic = ChainLink.didItHit ? attack : defend;
        return (
          <div className={styles.chainLinkSummary} key={ix.toString()}>
            <div className={styles.chainLinkSymbol}>
              <img src={hitPic} className={styles.chainLinkSymbol} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
