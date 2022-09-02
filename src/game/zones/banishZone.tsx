import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/displayrow';
import CardDisplay from '../elements/CardDisplay';
import Card from '../../features/Card';
import styles from './Cardzone.module.css';

export default function BanishZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const banishZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

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
