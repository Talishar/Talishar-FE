import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Player from '../../interface/player';
import styles from '../ActiveEffects.module.css';
import Card from '../../features/Card';

export interface CardProp {
  card?: Card;
  num?: number;
  name?: string;
}

export function Effect(prop: CardProp) {
  const src = `https://www.fleshandbloodonline.com/FaBOnline/crops/${
    prop.card!.cardNumber
  }_cropped.png`;
  return (
    <div className={styles.effect}>
      <img src={src} className={styles.img} />
    </div>
  );
}

export default function Effects(props: Player) {
  const classCSS = props.isPlayer ? styles.isPlayer : styles.isOpponent;
  const effects = props.isPlayer
    ? useSelector((state: RootState) => state.game.playerOne.Effects)
    : useSelector((state: RootState) => state.game.playerTwo.Effects);

  if (effects === undefined) {
    return <div className={classCSS} />;
  }

  return (
    <div className={classCSS}>
      {effects.map((card: Card, index) => {
        return <Effect card={card} key={index} />;
      })}
    </div>
  );
}
