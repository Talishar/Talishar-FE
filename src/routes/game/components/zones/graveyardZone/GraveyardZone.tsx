import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import styles from './GraveyardZone.module.css';
import StackedCardZone from '../stackedCardZone/StackedCardZone';
import { useTranslation } from 'react-i18next';

export const GraveyardZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const { t } = useTranslation();

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  return (
    <StackedCardZone
      isPlayer={isPlayer}
      cards={graveyardZone}
      emptyLabel={t('ZONES.GRAVEYARD')}
      zoneName="Graveyard"
      styles={styles}
      zoneClassName={styles.graveyardZone}
    />
  );
});

export default GraveyardZone;
