import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import Card from '../../features/Card';
import styles from './Cardzone.module.css';

export default function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const arsenalCards = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Arsenal : state.game.playerTwo.Arsenal
  );

  console.log(arsenalCards);

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
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
