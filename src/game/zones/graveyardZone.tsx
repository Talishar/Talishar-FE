import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import { Card } from '../../features/Card';
import styles from './cardzone.module.css';

export function GraveyardZone(prop: Displayrow) {
  let graveyardZone: Card[] | undefined;

  if (prop.isPlayer) {
    graveyardZone = useSelector(
      (state: RootState) => state.game.playerOne.Graveyard
    );
  } else {
    graveyardZone = useSelector(
      (state: RootState) => state.game.playerTwo.Graveyard
    );
  }

  if (graveyardZone === undefined) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const numInGraveyard = graveyardZone.length;
  const cardToDisplay = graveyardZone[numInGraveyard - 1];

  return (
    <div className={styles.graveyardZone}>
      <CardDisplay card={cardToDisplay} num={numInGraveyard} />
    </div>
  );
}
