import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './HeadEqZone.module.css';

export const HeadEqZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.HeadEq : state.game.playerTwo.HeadEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.headZone}>Head</div>;
  }

  return (
    <div className={styles.headZone}>
      <CardDisplay card={cardToDisplay} isPlayer={isPlayer}/>
    </div>
  );
});

export default HeadEqZone;
