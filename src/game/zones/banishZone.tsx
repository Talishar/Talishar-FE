import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import { Card } from '../../features/cardSlice';
import styles from './cardzone.module.css';

export function BanishZone(prop: Displayrow) {
  let banishZone: Card[] | undefined;

  if (prop.isPlayer) {
    banishZone = useSelector((state: RootState) => state.game.playerOne.Banish);
  } else {
    banishZone = useSelector((state: RootState) => state.game.playerTwo.Banish);
  }

  if (banishZone === undefined) {
    return <div className={styles.banishZone}>Banish</div>;
  }

  const numInBanish = banishZone.length;
  const cardToDisplay = banishZone[numInBanish - 1];

  return (
    <div className={styles.banishZone}>
      <CardDisplay card={cardToDisplay} num={numInBanish} />
    </div>
  );
}
