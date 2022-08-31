import React from 'react';
import { Card } from '../../features/cardSlice';
import styles from './card.module.css';

export interface CardProp {
  card?: Card;
  num?: number;
  name?: string;
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

  function onClick() {
    console.log('I have been clicked!');
  }
  return (
    <div
      className={styles.card}
      style={sectionStyle}
      onClick={() => {
        onClick();
      }}
    >
      <img src={eqImg} className={styles.img} />
      {prop.num !== undefined && (
        <div className={styles.floatCover}>
          <div className={styles.number}>
            <div className={styles.text}>{prop.num}</div>
          </div>
        </div>
      )}
    </div>
  );
}
