import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function HeadEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.HeadEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.HeadEq
    );
  }

  return (
    <div className={styles.hatZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
