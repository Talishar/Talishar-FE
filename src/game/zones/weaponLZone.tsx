import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function WeaponLZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.WeaponLEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.WeaponLEq
    );
  }
  return (
    <div className={styles.weaponLZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
