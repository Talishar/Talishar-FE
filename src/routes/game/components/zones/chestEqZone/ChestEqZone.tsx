import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import DestroyAnimation from '../../elements/destroyAnimation/DestroyAnimation';
import { useEquipDestroy } from '../../elements/destroyAnimation/useEquipDestroy';
import styles from './ChestEqZone.module.css';
import { useTranslation } from 'react-i18next';

export const ChestEqZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const { t } = useTranslation();

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.ChestEq : state.game.playerTwo.ChestEq
  );
  const destroy = useEquipDestroy('Chest', isPlayer);

  const subcardCount = cardToDisplay?.subcards?.length ?? 0;

  return (
    <div className={styles.chestZone}>
      {cardToDisplay === undefined ? (
        t('ZONES.CHEST')
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
});

export default ChestEqZone;
