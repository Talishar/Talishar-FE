import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './WeaponLZone.module.css';

export const WeaponLZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.WeaponLEq : state.game.playerTwo.WeaponLEq
  );
  return (
    <div className={styles.weaponLZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
});

export default WeaponLZone;
