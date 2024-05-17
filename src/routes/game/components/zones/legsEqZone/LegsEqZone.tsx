import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './LegsEqZone.module.css';

export const LegsEqZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.LegsEq : state.game.playerTwo.LegsEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.legsZone}>Legs</div>;
  }

  return (
    <div className={styles.legsZone}>
      <CardDisplay card={cardToDisplay} isPlayer={isPlayer}/>
    </div>
  );
});

export default LegsEqZone;
