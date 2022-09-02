import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function WeaponLZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const cardToDisplay = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.WeaponLEq : state.game.playerTwo.WeaponLEq
  );
  return (
    <div className={styles.weaponLZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
