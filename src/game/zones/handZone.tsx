import React from 'react';
import { useSelector } from 'react-redux';
import styles from './HandZone.module.css';
import { RootState } from '../../app/Store';
import Player from '../../interface/player';
import Card from '../../features/Card';
import CardDisplay from '../elements/CardDisplay';

export default function HandZone(prop: Player) {
  const { isPlayer } = prop;

  const handCards = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Hand : state.game.playerTwo.Hand
  );

  let displayRow = isPlayer ? styles.isPlayer : styles.isOpponent;
  displayRow = `${displayRow} ${styles.handZone}`;

  if (handCards === undefined) {
    return <div className={displayRow}></div>;
  }

  return (
    <div className={displayRow}>
      {handCards.map((card: Card, index) => {
        return <CardDisplay card={card} key={index} />;
      })}
    </div>
  );
}
