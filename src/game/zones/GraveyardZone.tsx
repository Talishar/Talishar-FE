import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import Card from '../../features/Card';
import styles from './Cardzone.module.css';

export default function GraveyardZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const graveyardZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

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
