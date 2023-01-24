import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import styles from './ArsenalZone.module.css';

export default function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const arsenalCards = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal
      : state.game.playerTwo.Arsenal;
  });

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    return (
      <div className={styles.arsenalContainer}>
        <div className={styles.arsenalZone}>Arsenal</div>
      </div>
    );
  }

  return (
    <div className={styles.arsenalContainer}>
      <div className={styles.arsenalZone}>
        {arsenalCards.map((card: Card, index) => {
          return <CardDisplay card={card} key={index} />;
        })}
      </div>
    </div>
  );
}
