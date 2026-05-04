import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './ArmsEqZone.module.css';

export const ArmsEqZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.ArmsEq : state.game.playerTwo.ArmsEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.armsZone}>Arms</div>;
  }

  const subcardCount = cardToDisplay.subcards?.length ?? 0;

  return (
    <div className={styles.armsZone}>
      <CardDisplay card={cardToDisplay} isPlayer={isPlayer} />
      {subcardCount > 0 && (
        <div className={styles.subcardCounter} title={`${subcardCount} card${subcardCount !== 1 ? 's' : ''} underneath`}>
          x {subcardCount}
        </div>
      )}
    </div>
  );
});

export default ArmsEqZone;
