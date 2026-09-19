import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import styles from './BanishZone.module.css';
import StackedCardZone from '../stackedCardZone/StackedCardZone';
import { useTranslation } from 'react-i18next';

export const BanishZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const { t } = useTranslation();

  const banishZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  return (
    <StackedCardZone
      isPlayer={isPlayer}
      cards={banishZone}
      emptyLabel={t('ZONES.BANISH')}
      zoneName="Banish Zone"
      styles={styles}
      zoneClassName={styles.banishZone}
    />
  );
});

export default BanishZone;
