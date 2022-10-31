import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import Displayrow from '../../../interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from '../Cardzone.module.css';

export default function ChestEqZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.ChestEq : state.game.playerTwo.ChestEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.chestZone}>Chest</div>;
  }

  return (
    <div className={styles.chestZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
