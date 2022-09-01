import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { CardDisplay } from './card';
import styles from './combatChain.module.css';

export function Reactions() {
  const activeCombatChain = useSelector(
    (state: RootState) => state.game.activeCombatChain
  );
  if (activeCombatChain === undefined) {
    return <div className={styles.currentAttack}>EmptyChain</div>;
  }

  return (
    <div className={styles.reactions}>
      {activeCombatChain.reactionCards?.map((card, ix) => {
        return <CardDisplay card={card} key={ix.toString()} />;
      })}
    </div>
  );
}
