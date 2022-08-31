import React, { useState } from 'react';
import { RootState } from '../../app/store';
import { useSelector } from 'react-redux';
import { Player } from '../../interface/player';
import styles from '../activeEffects.module.css';
import { Card } from '../../features/cardSlice';

export interface CardProp {
  card?: Card;
  num?: number;
  name?: string;
}

export function Effect(prop: CardProp) {
  const src =
    'https://www.fleshandbloodonline.com/FaBOnline/crops/' +
    prop.card!.cardNumber +
    '_cropped.png';
  return (
    <div className={styles.effect}>
      <img src={src} className={styles.img} />
    </div>
  );
}

export function Effects(props: Player) {
  const classCSS = props.isPlayer ? styles.isPlayer : styles.isOpponent;
  const effects = props.isPlayer
    ? useSelector((state: RootState) => state.game.playerOne.Effects)
    : useSelector((state: RootState) => state.game.playerTwo.Effects);

  if (effects === undefined) {
    return <div className={classCSS}></div>;
  }

  return (
    <div className={classCSS}>
      {effects.map((card: Card, index) => {
        return <Effect card={card} key={index} />;
      })}
    </div>
  );
}

{
  /* <img
  style="border: 1px solid transparent; height:65; width:83.85px; position:relative;"
  src="./crops/ARC044_cropped.png"
></img>; */
}
