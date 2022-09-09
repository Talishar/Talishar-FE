import React from 'react';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import CardDisplay from './CardDisplay';
import styles from './CombatChain.module.css';

export default function Reactions() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeCombatChain
  );
  if (activeCombatChain === undefined) {
    return <div className={styles.currentAttack}></div>;
  }

  return (
    <div className={styles.reactionWrapper}>
      <div className={styles.reactions}>
        {activeCombatChain.reactionCards?.map((card, ix) => {
          return (
            <div key={ix.toString()} className={styles.cardContainer}>
              <CardDisplay card={card} key={ix.toString()} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
