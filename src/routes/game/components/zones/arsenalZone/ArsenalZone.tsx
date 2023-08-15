import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import styles from './ArsenalZone.module.css';

export default function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const isSpectator = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 3;
  });

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
          // if it doesn't belong to us we don't need to know if it's faceup or facedown.
          const cardCopy = { ...card };
          return <CardDisplay card={cardCopy} key={index} isPlayer={isPlayer} />;
        })}
      </div>
    </div>
  );
}
