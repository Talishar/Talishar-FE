import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './WeaponRZone.module.css';

export const WeaponRZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.WeaponREq : state.game.playerTwo.WeaponREq
  );

  return (
    <div className={styles.weaponRZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
});

export default WeaponRZone;
