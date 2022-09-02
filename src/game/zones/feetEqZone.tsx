import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function FeetEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.FeetEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.FeetEq
    );
  }
  return (
    <div className={styles.feetZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
