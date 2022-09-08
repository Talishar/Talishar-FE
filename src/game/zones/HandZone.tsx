import React from 'react';
import styles from './HandZone.module.css';
import { RootState } from '../../app/Store';
import Player from '../../interface/Player';
import Card from '../../features/Card';
import CardDisplay from '../elements/CardDisplay';
import { useAppSelector } from '../../app/Hooks';

export default function HandZone(prop: Player) {
  const { isPlayer } = prop;

  const handCards = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Hand : state.game.playerTwo.Hand
  );

  let displayRow = isPlayer ? styles.isPlayer : styles.isOpponent;
  displayRow = `${displayRow} ${styles.handZone}`;

  if (isPlayer) {
    return <div className={displayRow}></div>;
  }

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
