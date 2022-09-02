import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function HeroZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.Hero
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.Hero
    );
  }
  return (
    <div className={styles.heroZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}
