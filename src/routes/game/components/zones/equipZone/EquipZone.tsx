import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import DestroyAnimation from '../../elements/destroyAnimation/DestroyAnimation';
import {
  EquipDestroySlot,
  useEquipDestroy
} from '../../elements/destroyAnimation/useEquipDestroy';
import styles from './EquipZone.module.css';
import { useTranslation } from 'react-i18next';

export interface EquipZoneProps extends Displayrow {
  slot: Extract<EquipDestroySlot, 'Head' | 'Chest' | 'Arms' | 'Legs'>;
  zoneClassName: string;
}

export const EquipZone = React.memo(
  ({ isPlayer, slot, zoneClassName }: EquipZoneProps) => {
    const { t } = useTranslation();

    const cardToDisplay = useAppSelector((state: RootState) =>
      isPlayer
        ? state.game.playerOne[`${slot}Eq`]
        : state.game.playerTwo[`${slot}Eq`]
    );
    const destroy = useEquipDestroy(slot, isPlayer);

    const subcardCount = cardToDisplay?.subcards?.length ?? 0;

    return (
      <div className={zoneClassName}>
        {cardToDisplay === undefined ? (
          t(`ZONES.${slot.toUpperCase()}`)
        ) : (
          <>
            <CardDisplay card={cardToDisplay} isPlayer={isPlayer} />
            {subcardCount > 0 && (
              <div
                className={styles.subcardCounter}
                title={`${subcardCount} card${
                  subcardCount !== 1 ? 's' : ''
                } underneath`}
              >
                x {subcardCount}
              </div>
            )}
          </>
        )}
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

export default EquipZone;
