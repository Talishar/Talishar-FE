import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function WeaponRZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.WeaponREq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.WeaponREq
    );
  }
  return (
    <div className={styles.weaponRZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
