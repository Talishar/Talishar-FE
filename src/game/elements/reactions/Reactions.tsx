import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './Reactions.module.css';

export default function Reactions() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink?.reactionCards
  );
  if (activeCombatChain === undefined) {
    return <div className={styles.currentAttack}></div>;
  }

  return (
    <div className={styles.reactionWrapper}>
      <div className={styles.reactions}>
        {activeCombatChain?.map((card, ix) => {
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
