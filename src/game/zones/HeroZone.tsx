import React from 'react';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function HeroZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Hero : state.game.playerTwo.Hero
  );

  return (
    <div className={styles.heroZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
