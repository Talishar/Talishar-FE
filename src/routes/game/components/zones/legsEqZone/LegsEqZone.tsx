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

  const subcardCount = cardToDisplay.subcards?.length ?? 0;

  return (
    <div className={styles.legsZone}>
      <CardDisplay card={cardToDisplay} isPlayer={isPlayer} />
      {subcardCount > 0 && (
        <div className={styles.subcardCounter} title={`${subcardCount} card${subcardCount !== 1 ? 's' : ''} underneath`}>
          x {subcardCount}
        </div>
      )}
    </div>
  );
});

export default LegsEqZone;
