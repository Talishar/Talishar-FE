import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/Store';
import Card from '../../features/Card';
import { clearPopUp, gameSlice, setPopUp } from '../../features/game/GameSlice';
import styles from './Card.module.css';

export interface CardProp {
  card?: Card;
  num?: number;
  name?: string;
}

export default function CardDisplay(prop: CardProp) {
  const { card } = prop;
  let { num } = prop;
  const classStyles: string[] = [styles.floatTint];
  const equipStatus: string[] = [styles.floatTint];
  const dispatch = useDispatch();

  if (card == null || card.cardNumber === '') {
    return null;
  }

  if (card.counters !== 0 && card.counters != undefined) {
    num = card.counters;
  }

  let eqImg = '';
  eqImg = `https://www.fleshandbloodonline.com/FaBOnline/concat/${card.cardNumber}.webp`;

  function onClick() {
    console.log('I have been clicked!');
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    console.log(e.pageX);
    const onRight = e.pageX < window.innerWidth / 2 ? true : false;
    console.log(onRight);
    dispatch(setPopUp({ cardNumber: card.cardNumber, onRight: onRight }));
  };

  const handleMouseLeave = () => {
    console.log('mouse leave');
    dispatch(clearPopUp());
  };

  if (card.overlay === 'disabled') {
    classStyles.push(styles.disabled);
  }

  if (card.borderColor !== undefined) {
    // not implemented
    classStyles.push('border' + card.borderColor);
  }

  if (card.isBroken) {
    equipStatus.push(styles.isBroken);
  }

  if (card.onChain) {
    equipStatus.push(styles.onChain);
  }

  if (card.isFrozen) {
    equipStatus.push(styles.isFrozen);
  }

  return (
    <div
      className={styles.card}
      onClick={() => {
        onClick();
      }}
      onMouseEnter={(e) => handleMouseEnter(e)}
      onMouseLeave={() => handleMouseLeave()}
    >
      <img src={eqImg} className={styles.img} />

      <div className={classStyles.join(' ')}></div>
      <div className={equipStatus.join(' ')}></div>
      {num !== undefined && num !== 0 && (
        <div className={styles.floatCover}>
          <div className={styles.number}>
            <div className={styles.text}>{num}</div>
          </div>
        </div>
      )}
    </div>
  );
}
