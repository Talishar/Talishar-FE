import React from 'react';
import Card from '../../features/Card';
import styles from './Card.module.css';

export interface CardProp {
  card?: Card;
  num?: number;
  name?: string;
}

export default function CardDisplay(prop: CardProp) {
  const { card } = prop;

  if (card == null || card.cardNumber === '') {
    return null;
  }

  let eqImg = '';
  let sectionStyle = {};
  eqImg = `https://www.fleshandbloodonline.com/FaBOnline/concat/${card.cardNumber}.webp`;
  sectionStyle = {
    backgroundImage: `url(${{ eqImg }})`
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
