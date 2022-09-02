import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function WeaponRZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const cardToDisplay = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.WeaponREq : state.game.playerTwo.WeaponREq
  );

  return (
    <div className={styles.weaponRZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
