import React from 'react';
import { Card } from '../../features/cardSlice';
import styles from './card.module.css';

export interface CardProp {
  card?: Card;
}

export function CardDisplay(prop: CardProp) {
  if (prop.card == null || prop.card.cardNumber == '') {
    return <></>;
  }
  let eqImg = '';
  let sectionStyle = {};
  eqImg =
    'https://www.fleshandbloodonline.com/FaBOnline/concat/' +
    prop.card.cardNumber +
    '.webp';
  sectionStyle = {
    backgroundImage: 'url(' + { eqImg } + ')'
  };
  return (
    <div className={styles.card} style={sectionStyle}>
      <img src={eqImg} />
    </div>
  );
}
