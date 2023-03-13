import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './LandmarkZone.module.css';
import { shallowEqual } from 'react-redux';

export const LandmarkZone = () => {
  const cardToDisplay = useAppSelector(
    (state: RootState) => state.game.landmark,
    shallowEqual
  );

  if (cardToDisplay === undefined) {
    return null;
  }

  return (
    <div className={styles.landmark}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
};

export default LandmarkZone;
