import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import { Card } from '../../features/Card';
import styles from './cardzone.module.css';

export function ArsenalZone(prop: Displayrow) {
  let arsenalCards: Card[] | undefined;

  if (prop.isPlayer) {
    arsenalCards = useSelector(
      (state: RootState) => state.game.playerOne.Arsenal
    ) as Card[];
  } else {
    arsenalCards = useSelector(
      (state: RootState) => state.game.playerTwo.Arsenal
    ) as Card[];
  }

  if (arsenalCards === undefined) {
    return <div className={styles.arsenalZone}>Arsenal</div>;
  }

  return (
    <div className={styles.arsenalZone}>
      {arsenalCards.map((card: Card, index) => {
        return <CardDisplay card={card} key={index} />;
      })}
    </div>
  );
}
