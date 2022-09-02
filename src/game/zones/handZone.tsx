import React from 'react';
import { useSelector } from 'react-redux';
import styles from './handZone.module.css';
import { RootState } from '../../app/Store';
import { Player } from '../../interface/player';
import { Card } from '../../features/Card';
import { CardDisplay } from '../elements/card';

export function HandZone(prop: Player) {
  let handCards: Card[] | undefined;
  if (prop.isPlayer) {
    handCards = useSelector(
      (state: RootState) => state.game.playerOne.Hand
    ) as Card[];
  } else {
    handCards = useSelector(
      (state: RootState) => state.game.playerTwo.Hand
    ) as Card[];
  }
  let displayRow = prop.isPlayer ? styles.isPlayer : styles.isOpponent;
  displayRow = `${displayRow} ${styles.handZone}`;
  if (handCards === undefined) {
    return <div className={displayRow}>Empty hand womp womp. :(</div>;
  }
  return (
    <div className={displayRow}>
      {handCards.map((card: Card, index) => {
        return <CardDisplay card={card} key={index} />;
      })}
    </div>
  );
}
