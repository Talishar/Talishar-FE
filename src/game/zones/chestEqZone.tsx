import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function ChestEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.ChestEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.ChestEq
    );
  }
  return (
    <div className={styles.chestZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
