import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function GlovesEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.GlovesEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.GlovesEq
    );
  }
  return (
    <div className={styles.glovesZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
