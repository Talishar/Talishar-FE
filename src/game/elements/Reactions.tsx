import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import CardDisplay from './CardDisplay';
import styles from './CombatChain.module.css';

export default function Reactions() {
  const activeCombatChain = useSelector(
    (state: RootState) => state.game.activeCombatChain
  );
  if (activeCombatChain === undefined) {
    return <div className={styles.currentAttack}>EmptyChain</div>;
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
