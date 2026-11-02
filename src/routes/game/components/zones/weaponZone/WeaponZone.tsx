import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import DestroyAnimation from '../../elements/destroyAnimation/DestroyAnimation';
import { useEquipDestroy } from '../../elements/destroyAnimation/useEquipDestroy';
import { selectIsP2View } from 'features/game/perspective';

export interface WeaponZoneProps extends Displayrow {
  side: 'L' | 'R';
  zoneClassName: string;
}

export const WeaponZone = React.memo(
  ({ isPlayer, side, zoneClassName }: WeaponZoneProps) => {
    const cardToDisplay = useAppSelector((state: RootState) =>
      isPlayer
        ? state.game.playerOne[`Weapon${side}Eq`]
        : state.game.playerTwo[`Weapon${side}Eq`]
    );
    const destroy = useEquipDestroy(`${side}Wep`, isPlayer);
    const isP2View = useAppSelector(selectIsP2View);

    return (
      <div
        className={zoneClassName}
        data-fan-unhover-anchor={isPlayer !== isP2View ? '' : undefined}
      >
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
  }
);

export default WeaponZone;
