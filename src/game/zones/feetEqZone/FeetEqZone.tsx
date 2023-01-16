import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import Displayrow from '../../../interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from '../Cardzone.module.css';

export const FeetEqZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.FeetEq : state.game.playerTwo.FeetEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.chestZone}>Feet</div>;
  }

  return (
    <div className={styles.feetZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
});

export default FeetEqZone;
