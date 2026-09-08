import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import DestroyAnimation from '../../elements/destroyAnimation/DestroyAnimation';
import { useEquipDestroy } from '../../elements/destroyAnimation/useEquipDestroy';
import styles from './WeaponLZone.module.css';

export const WeaponLZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.WeaponLEq : state.game.playerTwo.WeaponLEq
  );
  const destroy = useEquipDestroy('LWep', isPlayer);

  return (
    <div className={styles.weaponLZone}>
      <CardDisplay card={cardToDisplay} isPlayer={isPlayer} />
      {destroy && (
        <DestroyAnimation
          key={`equipDestroyAnim-${destroy.id}`}
          cardNumber={destroy.cardNumber}
          isPlayer={isPlayer}
        />
      )}
    </div>
  );
});

export default WeaponLZone;
