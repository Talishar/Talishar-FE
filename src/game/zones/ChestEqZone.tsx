import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function ChestEqZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const cardToDisplay = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.ChestEq : state.game.playerTwo.ChestEq
  );

  return (
    <div className={styles.chestZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
